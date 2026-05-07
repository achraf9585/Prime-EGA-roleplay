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
      family_name,
      family_picture,
      family_nationality,
      family_description,
      family_goals,
      family_members,
      discord_id 
    } = body;

    // Security check: Match session ID with provided Discord ID
    if (discord_id !== (session.user as any).id) {
      return NextResponse.json({ error: 'Identity mismatch detected' }, { status: 403 });
    }

    // Basic validation
    if (!family_name || !family_nationality || !family_description || !family_goals) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('FamilyApplications')
      .insert([
        { 
          family_name,
          family_picture: family_picture || null,
          family_nationality,
          family_description,
          family_goals,
          family_members: family_members || [],
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
