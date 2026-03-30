import { NextResponse } from 'next/server';
import { getActiveClients, markAsSent } from '@/services/notion';
import { sendEmail } from '@/services/email';
import { logActivity, saveSentHistory } from '@/services/supabase';
import { generateSubject } from '@/services/ai';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function markAsFailed(pageId: string) {
  await notion.pages.update({ page_id: pageId, properties: { Send_Status: { select: { name: 'Failed' } } } });
}

export async function POST(req: Request) {
  try {
    const { notion_page_id } = await req.json();
    const clients = await getActiveClients();
    const client = clients.find(c => c.notion_page_id === notion_page_id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    if (!client.email) {
      await markAsFailed(notion_page_id);
      await logActivity(client.name, 'failed', 'No email address');
      return NextResponse.json({ error: 'No email address for this client' }, { status: 400 });
    }
    const message = client.scheduled_message || client.ai_draft;
    if (!message) {
      await markAsFailed(notion_page_id);
      await logActivity(client.name, 'failed', 'No message to send');
      return NextResponse.json({ error: 'No message to send. Generate a draft first.' }, { status: 400 });
    }
    const subject = await generateSubject({ name: client.name, project: client.project || 'Project Update', last_update: client.last_update || message.slice(0, 50) }).catch(() => 'Update from your freelancer');
    await sendEmail(client.email, subject, message);
    await markAsSent(notion_page_id);
    await saveSentHistory(notion_page_id, client.name, message, subject);
    await logActivity(client.name, 'send_now', `Sent to ${client.email}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
