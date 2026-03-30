import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB = process.env.NOTION_DATABASE_ID!;

export interface NotionClient {
  notion_page_id: string;
  name: string;
  timezone: string;
  status: string;
  ai_draft: string;
  email: string;
  send_status: string;
  scheduled_message: string;
  project: string;
  last_update: string;
  next_action: string;
  send_window: string;
}

const mapPage = (page: any): NotionClient => ({
  notion_page_id: page.id,
  name: page.properties?.Name?.title?.[0]?.plain_text ?? '',
  timezone: page.properties?.Timezone?.select?.name ?? 'UTC',
  status: page.properties?.Status?.status?.name ?? '',
  ai_draft: page.properties?.AI_Draft?.rich_text?.[0]?.plain_text ?? '',
  email: page.properties?.Client_Email?.email ?? '',
  send_status: page.properties?.Send_Status?.select?.name ?? '',
  scheduled_message: page.properties?.Scheduled_Message?.rich_text?.[0]?.plain_text ?? '',
  project: page.properties?.Project?.rich_text?.[0]?.plain_text ?? '',
  last_update: page.properties?.Last_Update?.rich_text?.[0]?.plain_text ?? '',
  next_action: page.properties?.Next_Action?.rich_text?.[0]?.plain_text ?? '',
  send_window: page.properties?.Send_Window?.rich_text?.[0]?.plain_text ?? '10:00-14:00',
});

export async function getActiveClients(): Promise<NotionClient[]> {
  const res = await notion.databases.query({
    database_id: DB,
    filter: { property: 'Status', status: { equals: 'In progress' } },
  });
  return res.results.map(mapPage);
}

export async function getReadyToSendClients(): Promise<NotionClient[]> {
  const res = await notion.databases.query({
    database_id: DB,
    filter: { property: 'Send_Status', select: { equals: 'Ready' } },
  });
  return res.results.map(mapPage);
}

export async function writeDraft(pageId: string, draft: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      AI_Draft: { rich_text: [{ text: { content: draft } }] },
    },
  });
}

export async function markAsSent(pageId: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Send_Status: { select: { name: 'Sent' } },
    },
  });
}
