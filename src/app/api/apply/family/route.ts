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
      ic_name, 
      age, 
      experience, 
      backstory,
      discord_id 
    } = body;

    // Security check: Match session ID with provided Discord ID
    if (discord_id !== (session.user as any).id) {
        return NextResponse.json({ error: 'Identity mismatch detected' }, { status: 403 });
    }

    // Basic validation
    if (!ic_name || !age || !experience || !backstory) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('FamilyApplications')
      .insert([
        { 
          ic_name, 
          age: parseInt(age), 
          experience, 
          backstory,
          discord_id,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      // If table doesn't exist, we should probably log it
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
