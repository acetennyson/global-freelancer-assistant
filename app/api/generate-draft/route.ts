import { NextResponse } from 'next/server';
import { getActiveClients, writeDraft } from '@/services/notion';
import { generateDraft } from '@/services/ai';
import { logActivity, saveDraftHistory, getSentHistory } from '@/services/supabase';
import { AI_CONFIG } from '@/services/config';

export async function POST(req: Request) {
  try {
    const { notion_page_id } = await req.json();
    const clients = await getActiveClients();
    const client = clients.find(c => c.notion_page_id === notion_page_id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const missing = [];
    if (!client.project) missing.push('Project');
    if (!client.last_update) missing.push('Last_Update');
    if (missing.length) return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });

    // Fetch previously sent messages for context (not drafts — only what client actually received)
    const sentHistory = await getSentHistory(notion_page_id).catch(() => []);

    const draft = await generateDraft({
      name: client.name,
      project: client.project,
      last_update: client.last_update,
      next_action: client.next_action || '',
      history: sentHistory.slice(0, AI_CONFIG.sentHistoryLimit).map(h => ({ draft: h.message, created_at: h.sent_at })),
    });

    await writeDraft(notion_page_id, draft);
    await logActivity(client.name, 'draft_generated', draft.slice(0, 100));
    await saveDraftHistory(notion_page_id, client.name, draft);
    return NextResponse.json({ draft });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
