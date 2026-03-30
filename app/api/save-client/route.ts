import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB = process.env.NOTION_DATABASE_ID!;

export async function POST(req: Request) {
  try {
    const { notion_page_id, name, timezone, project, last_update, next_action, email, send_window, status } = await req.json();

    const properties: any = {
      ...(timezone && { Timezone: { select: { name: timezone } } }),
      ...(project !== undefined && { Project: { rich_text: [{ text: { content: project } }] } }),
      ...(last_update !== undefined && { Last_Update: { rich_text: [{ text: { content: last_update } }] } }),
      ...(next_action !== undefined && { Next_Action: { rich_text: [{ text: { content: next_action } }] } }),
      ...(last_update !== undefined && { Send_Status: { select: { name: 'Draft' } } }),
      ...(email !== undefined && { Client_Email: { email: email || null } }),
      ...(send_window !== undefined && { Send_Window: { rich_text: [{ text: { content: send_window } }] } }),
      ...(status && { Status: { status: { name: status } } }),
    };

    if (notion_page_id) {
      // Edit existing
      if (name) properties.Name = { title: [{ text: { content: name } }] };
      await notion.pages.update({ page_id: notion_page_id, properties });
    } else {
      // Create new
      properties.Name = { title: [{ text: { content: name || 'New Client' } }] };
      properties.Status = { status: { name: 'In progress' } };
      await notion.pages.create({ parent: { database_id: DB }, properties });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
