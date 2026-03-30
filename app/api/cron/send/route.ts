import { NextResponse } from 'next/server';
import { getReadyToSendClients, markAsSent } from '@/services/notion';
import { sendEmail } from '@/services/email';
import { isBusinessHours } from '@/services/time';
import { generateSubject } from '@/services/ai';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

import { logActivity } from '@/services/supabase';
import { saveSentHistory } from '@/services/supabase';

async function markAsFailed(pageId: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: { Send_Status: { select: { name: 'Failed' } } },
  });
}

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clients = await getReadyToSendClients();
  const results: string[] = [];

  for (const client of clients) {
    if (!isBusinessHours(client.timezone, client.send_window)) {
      results.push(`Skipped ${client.name} — not in business hours`);
      continue;
    }
    if (!client.email) {
      await markAsFailed(client.notion_page_id);
      results.push(`Failed ${client.name} — no email address`);
      continue;
    }

    const message = client.scheduled_message || client.ai_draft;
    if (!message) {
      await markAsFailed(client.notion_page_id);
      results.push(`Failed ${client.name} — no message`);
      continue;
    }

    try {
      const subject = await generateSubject({ name: client.name, project: client.project || 'Project Update', last_update: client.last_update || message.slice(0, 50) }).catch(() => 'Update from your freelancer');
      await sendEmail(client.email, subject, message);
      await markAsSent(client.notion_page_id);
      await saveSentHistory(client.notion_page_id, client.name, message, subject);
      await logActivity(client.name, 'sent', `Auto-sent to ${client.email}`);
      results.push(`Sent to ${client.name} (${client.email})`);
    } catch (e: any) {
      await markAsFailed(client.notion_page_id);
      results.push(`Failed ${client.name} — ${e.message}`);
    }
  }

  return NextResponse.json({ results });
}
