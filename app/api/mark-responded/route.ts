import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { logActivity } from '@/services/supabase';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function POST(req: Request) {
  try {
    const { notion_page_id, client_name, responded } = await req.json();
    await notion.pages.update({
      page_id: notion_page_id,
      properties: { Send_Status: { select: { name: responded ? 'Responded' : 'Sent' } } },
    });
    await logActivity(client_name, responded ? 'responded' : 'unresponded', responded ? 'Marked as responded' : 'Unmarked as responded');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
