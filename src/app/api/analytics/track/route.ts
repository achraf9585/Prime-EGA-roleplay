import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    const supabase = await createClient();
    
    // Get country from Vercel headers (works in production)
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    
    await supabase.from('SiteTraffic').insert([{ page_path: path, country }]);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
