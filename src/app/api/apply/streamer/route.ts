import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      ingame_name_cid, 
      discord_id, 
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
      privacy_comfort
    } = body;

    // Capture Discord identity from session
    const discord_name   = (session.user as any).name  ?? null;
    const discord_avatar = (session.user as any).image ?? null;

    // Security check: Match session ID with provided Discord ID
    if (discord_id !== (session.user as any).id) {
        return NextResponse.json({ error: 'Identity mismatch detect' }, { status: 403 });
    }

    // Basic validation
    if (!ingame_name_cid || !discord_id || !channel_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
