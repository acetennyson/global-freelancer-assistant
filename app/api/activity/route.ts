import { NextResponse } from 'next/server';
import { getRecentActivity } from '@/services/supabase';

export async function GET() {
  try {
    const logs = await getRecentActivity(20);
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
