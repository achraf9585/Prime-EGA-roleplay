import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    const supabase = await createClient();
    
    await supabase.from('SiteTraffic').insert([{ page_path: path }]);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
