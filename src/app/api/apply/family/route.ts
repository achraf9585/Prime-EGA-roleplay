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
  // Rate limit: max 3 family applications per hour per user
  const rl = rateLimit(`apply-family:${sessionId}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many submissions. Try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await request.json();
    const { family_picture, family_members, discord_id } = body;

    // Security check: Match session ID with provided Discord ID
    if (discord_id !== sessionId) {
      return NextResponse.json({ error: 'Identity mismatch detected' }, { status: 403 });
    }

    // Server-side validation with length caps
    const family_name = cleanString(body.family_name, { min: 2, max: 100 });
    const family_nationality = cleanString(body.family_nationality, { min: 2, max: 100 });
    const family_description = cleanString(body.family_description, { min: 1, max: 5000 });
    const family_goals = cleanString(body.family_goals, { min: 1, max: 5000 });

    if (!family_name || !family_nationality || !family_description || !family_goals) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Sanitize image URL (must be http(s); reject anything else)
    const safePicture = family_picture ? cleanImageUrl(family_picture) : null;

    // Cap and shape members array
    const safeMembers = Array.isArray(family_members) ? family_members.slice(0, 50) : [];

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('FamilyApplications')
      .insert([
        {
          family_name,
          family_picture: safePicture,
          family_nationality,
          family_description,
          family_goals,
          family_members: safeMembers,
          discord_id,
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
