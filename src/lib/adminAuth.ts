import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/server';

/**
 * Admin authentication via signed, HttpOnly session cookies.
 *
 * Old model (REMOVED): email+password stored in localStorage and sent as
 * x-admin-email / x-admin-password headers on every request — readable by any
 * XSS, never expiring. This replaces it with a short-lived HMAC-signed cookie
 * that JavaScript cannot read.
 */

export const ADMIN_SESSION_COOKIE = 'ega_admin_session';
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sessionSecret(): string {
  const s = process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error('Missing NEXTAUTH_SECRET for admin session signing');
  return s;
}

function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export type AdminRole = 'admin' | 'supervisor' | 'member' | 'app_reviewer';
export interface AdminSession { email: string; role: AdminRole }

/** Create a signed session token carrying the identity and role. */
export function signSession(email: string, role: AdminRole): string {
  const payload = { email, role, exp: Date.now() + ADMIN_SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/** Verify a session token; returns the payload if valid & unexpired, else null. */
export function verifySession(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  if (!timingSafeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return { email: String(payload.email), role: (payload.role || 'admin') as AdminRole };
  } catch {
    return null;
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

/** Returns the admin session payload from the request cookie, or null. */
export function getAdminSession(request: Request): AdminSession | null {
  return verifySession(readCookie(request, ADMIN_SESSION_COOKIE));
}

/** Returns the authenticated admin's email (or null). */
export function getAdminEmail(request: Request): string | null {
  return getAdminSession(request)?.email ?? null;
}

/**
 * Verifies credentials at LOGIN time and returns the authenticated role, or null.
 *  1. Master password (ADMIN_PASSWORD env, no email) → role 'admin'.
 *  2. Email + bcrypt hash from the AdminUsers table → that user's role.
 */
export async function verifyCredentials(
  email: string | undefined,
  password: string | undefined
): Promise<{ email: string; role: AdminRole } | null> {
  if (!password) return null;

  const masterPassword = process.env.ADMIN_PASSWORD;
  if (masterPassword && !email) {
    return timingSafeEqual(password.trim(), masterPassword.trim())
      ? { email: 'Super Admin', role: 'admin' }
      : null;
  }

  if (email && password) {
    const supabase = createAdminClient();
    const { data: admin, error } = await supabase
      .from('AdminUsers')
      .select('password, role')
      .eq('email', email.trim())
      .single();
    if (error || !admin) return null;
    const ok = await bcrypt.compare(password.trim(), admin.password);
    if (!ok) return null;
    return { email: email.trim(), role: (admin.role || 'admin') as AdminRole };
  }

  return null;
}

/** True only for FULL admins (role 'admin'). Used by admin-only routes. */
export async function isAdmin(request: Request): Promise<boolean> {
  return getAdminSession(request)?.role === 'admin';
}

/** Hashes a plaintext password using bcrypt (used when creating admin users). */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 12);
}
