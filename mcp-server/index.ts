import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '../.env' });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const DB = process.env.NOTION_DATABASE_ID!;

const getLocalHour = (timezone: string) =>
  parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: timezone }).format(new Date()));

const isBusinessHours = (timezone: string, window = '10:00-14:00') => {
  const h = getLocalHour(timezone);
  const [start, end] = window.split('-').map(t => parseInt(t.split(':')[0]));
  return h >= start && h < end;
};

const getLocalTime = (timezone: string) =>
  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone }).format(new Date());

type MCPClient = {
  notion_page_id: string; name: string; timezone: string;
  project?: string; last_update?: string; next_action?: string; send_window?: string;
};

async function fetchActiveClients(): Promise<MCPClient[]> {
  const res = await notion.databases.query({
    database_id: DB,
    filter: { property: 'Status', status: { equals: 'In progress' } },
  });
  return res.results.map((page: any): MCPClient => ({
    notion_page_id: page.id,
    name: page.properties.Name?.title[0]?.plain_text ?? '',
    timezone: page.properties.Timezone?.select?.name ?? 'UTC',
    project: page.properties.Project?.rich_text[0]?.plain_text ?? '',
    last_update: page.properties.Last_Update?.rich_text[0]?.plain_text ?? '',
    next_action: page.properties.Next_Action?.rich_text[0]?.plain_text ?? '',
    send_window: page.properties.Send_Window?.rich_text[0]?.plain_text ?? '10:00-14:00',
  }));
}

async function generateDraft(client: MCPClient): Promise<string> {
  const freelancerName = process.env.FREELANCER_NAME || 'Your Freelancer';
  const prompt = `Write a short professional email from a freelancer to their client.
Freelancer: ${freelancerName}, Client: ${client.name}
Project: ${client.project || 'our project'}
Last update: ${client.last_update || 'recent work'}
${client.next_action ? `Next action: ${client.next_action}` : "Ball is in client's court."}
Start with "Hi ${client.name}," sign off with "${freelancerName}". Max 80 words.`;

  const keys = (process.env.GEMINI_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);
  for (const key of keys) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch {}
  }
  return `Hi ${client.name}, just checking in on ${client.project || 'our project'}. Let me know if you need anything. ${freelancerName}`;
}

async function fetchClientFromSupabase(client_id: string): Promise<MCPClient | null> {
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('notion_page_id', client_id)
    .single();
  if (!data) return null;
  return {
    notion_page_id: data.notion_page_id,
    name: data.name,
    timezone: data.timezone,
    project: data.project ?? '',
    last_update: data.last_update ?? '',
    next_action: data.next_action ?? '',
    send_window: data.send_window ?? '10:00-14:00',
  };
}

const server = new McpServer({ name: 'nightshift', version: '1.0.0' });

server.tool('get_client_local_times', {}, async () => {
  const clients = await fetchActiveClients();
  const result = clients.map(c => ({
    name: c.name, timezone: c.timezone,
    localTime: getLocalTime(c.timezone),
    available: isBusinessHours(c.timezone, c.send_window),
  }));
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.tool('generate_client_outreach', { client_id: z.string() }, async ({ client_id }) => {
  const clients = await fetchActiveClients();
  const client = clients.find(c => c.notion_page_id === client_id);
  if (!client) return { content: [{ type: 'text', text: 'Client not found.' }] };
  if (!isBusinessHours(client.timezone, client.send_window))
    return { content: [{ type: 'text', text: `${client.name} is not in business hours (${getLocalTime(client.timezone)} local). Skipping.` }] };

  const draft = await generateDraft(client);
  await notion.pages.update({ page_id: client_id, properties: { AI_Draft: { rich_text: [{ text: { content: draft } }] } } });
  return { content: [{ type: 'text', text: `Draft written for ${client.name}: "${draft}"` }] };
});

server.tool('sync_and_draft', { client_id: z.string() }, async ({ client_id }) => {
  // Uses Supabase cache — faster, avoids Notion rate limits
  // Run the dashboard Sync first to ensure data is fresh
  const client = await fetchClientFromSupabase(client_id);
  if (!client) return { content: [{ type: 'text', text: 'Client not found in Supabase. Run Sync from the dashboard first.' }] };
  if (!isBusinessHours(client.timezone, client.send_window))
    return { content: [{ type: 'text', text: `Skipped ${client.name} — it's ${getLocalTime(client.timezone)} their time.` }] };

  const draft = await generateDraft(client);
  await notion.pages.update({ page_id: client_id, properties: { AI_Draft: { rich_text: [{ text: { content: draft } }] } } });
  return { content: [{ type: 'text', text: `Done. Draft written for ${client.name} (via Supabase cache).` }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
