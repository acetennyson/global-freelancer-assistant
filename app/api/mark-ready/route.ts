import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { logActivity } from '@/services/supabase';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export async function POST(req: Request) {
  try {
    const { notion_page_id, client_name } = await req.json();
    await notion.pages.update({
      page_id: notion_page_id,
      properties: { Send_Status: { select: { name: 'Ready' } } },
    });
    await logActivity(client_name || 'Unknown', 'marked_ready', 'Marked as ready to send');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
