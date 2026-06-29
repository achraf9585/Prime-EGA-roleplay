import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { Resend } from 'resend';

export async function POST(req: Request) {
  // Throttle to prevent email-bombing / enumeration
  const rl = rateLimit(`forgot:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { email } = await req.json().catch(() => ({ email: undefined }));
  // Always respond OK — never reveal whether an email exists
  if (!email || typeof email !== 'string') return NextResponse.json({ ok: true });

  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from('AdminUsers')
    .select('email')
    .eq('email', email.trim())
    .single();

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await supabase.from('password_reset_tokens').insert({
      email: user.email,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const link = `${base}/admin/reset-password?token=${rawToken}`;

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    if (resend) {
      try {
        await resend.emails.send({
          from: 'EGA Roleplay <ega@egaroleplay.com>',
          to: user.email,
          subject: 'EGA Roleplay — Password Reset',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
              <h1 style="color:#8b5cf6;">Password Reset</h1>
              <p>A password reset was requested for your EGA staff account.</p>
              <p>Click the button below to set a new password. This link expires in <b>1 hour</b>.</p>
              <p style="margin: 24px 0;">
                <a href="${link}" style="background:#8b5cf6;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
              </p>
              <p style="font-size:12px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
            </div>`,
        });
      } catch (e) {
        console.error('Failed to send reset email:', e);
      }
    } else {
      // No email provider configured — log the link so an admin can deliver it manually
      console.warn('[forgot-password] RESEND_API_KEY not set. Reset link:', link);
    }
  }

  return NextResponse.json({ ok: true });
}
