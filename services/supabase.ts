import { createClient } from '@supabase/supabase-js';
import { NotionClient } from './notion';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function upsertClients(clients: NotionClient[]) {
  const { error } = await supabase
    .from('clients')
    .upsert(
      clients.map(({ notion_page_id, name, timezone, project, last_update, next_action, send_window }) => ({
        notion_page_id, name, timezone,
        project: project || null,
        last_update: last_update || null,
        next_action: next_action || null,
        send_window: send_window || '10:00-14:00',
        last_sync: new Date().toISOString(),
      })),
      { onConflict: 'notion_page_id' }
    );
  if (error) throw error;
}

export async function getClientById(notion_page_id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('notion_page_id', notion_page_id)
    .single();
  if (error) throw error;
  return data;
}

export async function logActivity(client_name: string, action: string, detail?: string) {
  await supabase.from('activity_logs').insert({ client_name, action, detail });
}

export async function getRecentActivity(limit = 20) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function saveDraftHistory(notion_page_id: string, client_name: string, draft: string) {
  await supabase.from('draft_history').insert({ notion_page_id, client_name, draft });
}

export async function getDraftHistory(notion_page_id: string) {
  const { data, error } = await supabase
    .from('draft_history')
    .select('*')
    .eq('notion_page_id', notion_page_id)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

export async function saveSentHistory(notion_page_id: string, client_name: string, message: string, subject?: string) {
  await supabase.from('sent_history').insert({ notion_page_id, client_name, message, subject });
}

export async function getSentHistory(notion_page_id: string) {
  const { data, error } = await supabase
    .from('sent_history')
    .select('*')
    .eq('notion_page_id', notion_page_id)
    .order('sent_at', { ascending: false })
    .limit(5);
  if (error) throw error;
  return data ?? [];
}
