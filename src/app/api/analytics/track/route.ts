import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { cleanString } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    // Public endpoint — rate limit hard to prevent DB flooding (30 hits / 10 min / IP)
    const ip = clientIp(request);
    const rl = rateLimit(`track:${ip}`, 30, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ success: false }, { status: 429 });
    }

    const body = await request.json();
    const path = cleanString(body.path, { min: 1, max: 512 });
    if (!path) {
      return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 });
    }

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
