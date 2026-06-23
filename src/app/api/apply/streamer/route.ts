import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { rateLimit } from '@/lib/rateLimit';
import { cleanString, cleanImageUrl } from '@/lib/validation';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = (session.user as any).id;
  // Rate limit: max 3 streamer applications per hour per user
  const rl = rateLimit(`apply-streamer:${sessionId}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many submissions. Try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const {
      discord_id,
      email,
      platform,
      followers_count,
      rp_experience,
      ensemble_mindset,
      strict_rp_standards,
      history_info,
      sample_content,
      stream_schedule,
      privacy_comfort
    } = body;

    // Capture Discord identity from session
    const discord_name   = (session.user as any).name  ?? null;
    const discord_avatar = (session.user as any).image ?? null;

    // Security check: Match session ID with provided Discord ID
    if (discord_id !== sessionId) {
        return NextResponse.json({ error: 'Identity mismatch detect' }, { status: 403 });
    }

    // Server-side validation
    const ingame_name_cid = cleanString(body.ingame_name_cid, { min: 2, max: 100 });
    const channel_url = cleanImageUrl(body.channel_url); // http(s) URL, capped
    if (!ingame_name_cid || !channel_url) {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('StreamerApplications')
      .insert([
        { 
          ingame_name_cid, 
          discord_id,
          discord_name,
          discord_avatar,
          email,
          platform, 
          channel_url, 
          followers_count,
          rp_experience,
          ensemble_mindset,
          strict_rp_standards,
          history_info,
          sample_content,
          stream_schedule,
          privacy_comfort,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
