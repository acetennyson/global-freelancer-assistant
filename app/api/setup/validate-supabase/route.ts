import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = await req.json();
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY)
      return NextResponse.json({ error: 'Both URL and anon key are required' }, { status: 400 });

    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { error } = await supabase.from('clients').select('notion_page_id').limit(1);
    if (error && error.code !== 'PGRST116') // PGRST116 = table doesn't exist yet, that's ok
      return NextResponse.json({ error: 'Could not connect. Check your URL and key.' }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid Supabase credentials' }, { status: 400 });
  }
}
