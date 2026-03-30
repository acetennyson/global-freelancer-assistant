import { NextResponse } from 'next/server';
import { getReadyToSendClients, markAsSent } from '@/services/notion';
import { sendEmail } from '@/services/email';
import { isBusinessHours } from '@/services/time';
import { generateSubject } from '@/services/ai';
import { logActivity, saveSentHistory } from '@/services/supabase';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function markAsFailed(pageId: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: { Send_Status: { select: { name: 'Failed' } } },
  });
}

// Send All Ready — same as cron but triggered manually
export async function POST() {
  const clients = await getReadyToSendClients();
  const results: { name: string; status: string }[] = [];

  for (const client of clients) {
    if (!isBusinessHours(client.timezone, client.send_window)) {
      results.push({ name: client.name, status: 'skipped — not in window' });
      continue;
    }
    if (!client.email) {
      await markAsFailed(client.notion_page_id);
      results.push({ name: client.name, status: 'failed — no email' });
      continue;
    }
    const message = client.scheduled_message || client.ai_draft;
    if (!message) {
      await markAsFailed(client.notion_page_id);
      results.push({ name: client.name, status: 'failed — no message' });
      continue;
    }
    try {
      const subject = await generateSubject({ name: client.name, project: client.project || 'Project Update', last_update: client.last_update || message.slice(0, 50) }).catch(() => 'Update from your freelancer');
      await sendEmail(client.email, subject, message);
      await markAsSent(client.notion_page_id);
      await saveSentHistory(client.notion_page_id, client.name, message, subject);
      results.push({ name: client.name, status: 'sent' });
    } catch (e: any) {
      await markAsFailed(client.notion_page_id);
      results.push({ name: client.name, status: `failed — ${e.message}` });
    }
  }

  return NextResponse.json({ results });
}
