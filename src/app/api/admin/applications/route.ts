import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import { isAdmin } from '@/lib/adminAuth';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(request: Request) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase.from('StreamerApplications').select('*').order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { status } = await request.json();

    if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 });

    const supabase = createAdminClient();
    
    // Fetch user info first to get the email
    const { data: appData } = await supabase.from('StreamerApplications').select('*').eq('id', id).single();

    const { data, error } = await supabase.from('StreamerApplications').update({ status }).eq('id', id).select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send Email Notification
    if (resend && appData?.email) {
        try {
            const isApproved = status === 'approved';
            await resend.emails.send({
                from: 'EGA Roleplay <ega@egaroleplay.com>',
                to: appData.email,
                subject: isApproved ? 'EGA Roleplay: Partnership Approved!' : 'EGA Roleplay: Application Update',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h1 style="color: ${isApproved ? '#f59e0b' : '#ef4444'}">Streamer Application ${status.toUpperCase()}</h1>
                        <p>Hello <b>${appData.ingame_name_cid}</b>,</p>
                        <p>${isApproved 
                            ? "Congratulations! Your application to become an official EGA Creator has been <b>Approved</b>. Our media team will contact you via Discord shortly with your roles and branding assets." 
                            : "Thank you for your interest in our creator program. After reviewing your application, we have decided not to move forward at this time. You are welcome to re-apply in 30 days."}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">This is an automated message from  EGA Board.</p>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error('Failed to send email:', mailErr);
        }
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
