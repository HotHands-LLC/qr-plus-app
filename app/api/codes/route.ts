import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const { data, error } = await supabaseAdmin
      .from('qr_codes')
      .select('id, code_slug, agent_id, context_hints, scan_count, created_at')
      .eq('code_slug', slug)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  }

  const { data, error } = await supabaseAdmin
    .from('qr_codes')
    .select('id, code_slug, agent_id, scan_count, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, destination_url, owner_email, agent_id } = body;

    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    // Generate a slug from name or random
    const slugBase = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 20);

    const suffix = crypto.randomBytes(3).toString('hex');
    const code_slug = `${slugBase}-${suffix}`;

    const { data, error } = await supabaseAdmin
      .from('qr_codes')
      .insert({
        code_slug,
        owner_email: owner_email || null,
        destination_url: destination_url || null,
        agent_id: agent_id || 'default',
        context_hints: { name },
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ...data,
      qr_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://qr.hotdeck.com'}/${code_slug}`,
    });
  } catch (err) {
    console.error('Codes API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
