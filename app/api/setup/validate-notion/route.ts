import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

export async function POST(req: Request) {
  try {
    const { NOTION_TOKEN, NOTION_DATABASE_ID } = await req.json();
    if (!NOTION_TOKEN) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    const notion = new Client({ auth: NOTION_TOKEN });

    if (NOTION_DATABASE_ID) {
      await notion.databases.retrieve({ database_id: NOTION_DATABASE_ID });
    } else {
      await notion.users.me({});
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message?.includes('Could not find') ? 'Database not found or not shared with integration' : 'Invalid token' }, { status: 400 });
  }
}
