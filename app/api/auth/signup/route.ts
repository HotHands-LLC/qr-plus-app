import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, permissions } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Upsert user
    const { data, error } = await supabaseAdmin
      .from('qr_users')
      .upsert(
        {
          email,
          permissions: permissions || {},
        },
        { onConflict: 'email' }
      )
      .select('id, email')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ userId: data.id, email: data.email });
  } catch (err) {
    console.error('Auth signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
