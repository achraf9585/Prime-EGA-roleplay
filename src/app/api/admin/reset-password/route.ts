import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/server';
import { hashPassword } from '@/lib/adminAuth';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const rl = rateLimit(`reset:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { token, password } = await req.json().catch(() => ({}));
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('used', false)
    .single();

  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const { error: updateErr } = await supabase
    .from('AdminUsers')
    .update({ password: hashed })
    .eq('email', row.email);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }

  // Single-use: burn the token (and any other outstanding tokens for this email)
  await supabase.from('password_reset_tokens').update({ used: true }).eq('email', row.email);

  return NextResponse.json({ ok: true });
}
