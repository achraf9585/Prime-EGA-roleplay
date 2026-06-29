import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import { getAdminSession, verifyCredentials, hashPassword } from '@/lib/adminAuth';

export async function POST(req: Request) {
  const session = getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // The master-password admin has no AdminUsers row — its password lives in env.
  if (session.email === 'Super Admin') {
    return NextResponse.json(
      { error: 'The master admin password is set via environment configuration and cannot be changed here.' },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = await req.json().catch(() => ({}));
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  }

  const ok = await verifyCredentials(session.email, currentPassword);
  if (!ok) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const hashed = await hashPassword(newPassword);
  const { error } = await supabase
    .from('AdminUsers')
    .update({ password: hashed })
    .eq('email', session.email);

  if (error) {
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
