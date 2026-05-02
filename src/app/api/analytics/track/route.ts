import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    const supabase = createAdminClient();
    
    // Get country from Vercel headers (works in production)
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    
    const { error } = await supabase.from('SiteTraffic').insert([{ page_path: path, country }]);
    
    if (error) {
      console.error('[TrafficTracker] Insert error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[TrafficTracker] Unexpected error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
