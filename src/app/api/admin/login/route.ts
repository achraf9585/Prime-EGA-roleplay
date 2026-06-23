import { NextResponse } from 'next/server';
import { verifyCredentials, signSession, ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_MS } from '@/lib/adminAuth';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Throttle brute-force: 10 attempts / 15 min / IP
  const rl = rateLimit(`admin-login:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  let email: string | undefined;
  let password: string | undefined;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const auth = await verifyCredentials(email, password);
  if (!auth) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signSession(auth.email, auth.role);

  const res = NextResponse.json({ ok: true, email: auth.email, role: auth.role });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  });
  return res;
}
