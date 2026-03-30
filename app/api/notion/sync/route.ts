import { NextResponse } from 'next/server';
import { getActiveClients } from '@/services/notion';
import { upsertClients } from '@/services/supabase';

export async function GET() {
  try {
    const clients = await getActiveClients();
    await upsertClients(clients);
    return NextResponse.json({ message: 'Sync successful!', count: clients.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
