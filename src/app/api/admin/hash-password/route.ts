import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/adminAuth';

/**
 * One-time utility route to generate a bcrypt hash for a plaintext password.
 * Usage: GET /api/admin/hash-password?password=yourplaintextpassword
 * Copy the hash and store it in the AdminUsers table, then remove this route.
 */
export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');

  if (!password) {
    return NextResponse.json({ error: 'Pass ?password=yourpassword in the URL' }, { status: 400 });
  }

  const hash = await hashPassword(password);

  return NextResponse.json({
    password,
    hash,
    instruction: 'Copy this hash and update your AdminUsers row in Supabase. Then delete this route file.'
  });
}
