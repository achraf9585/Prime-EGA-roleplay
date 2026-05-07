import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('FamilyApplications')
    .select('*')
    .order('created_at', { ascending: false });

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
    const { data, error } = await supabase
      .from('FamilyApplications')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // If approved, automatically insert into active families
    if (status === 'approved' && data && data.length > 0) {
      const app = data[0];
      const { error: insertError } = await supabase
        .from('Family')
        .insert([{
          name: app.family_name || app.ic_name || 'Unknown Family',
          logo: app.family_picture || null,
          description: app.family_description || app.backstory || null,
        }]);
        
      if (insertError) {
        console.error("Failed to insert into active Family table:", insertError);
        // We don't fail the request, but log the error. 
        // The application is still marked as approved.
      }
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
