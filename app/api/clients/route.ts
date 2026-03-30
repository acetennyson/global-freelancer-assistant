import { NextResponse } from 'next/server';
import { getActiveClients } from '@/services/notion';

export async function GET() {
  try {
    const clients = await getActiveClients();
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
