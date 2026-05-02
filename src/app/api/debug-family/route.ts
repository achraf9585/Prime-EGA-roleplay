import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();
  
  const { data: family } = await supabase.from('Family').select('*');
  const { data: apps } = await supabase.from('FamilyApplications').select('*');
  
  return NextResponse.json({ family, apps });
}
