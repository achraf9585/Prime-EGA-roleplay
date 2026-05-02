import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  // Run all fetches in parallel for speed
  const [
    { data: codes },
    { data: apps },
    { data: familyApps },
    { count: staffCount },
    { data: recentCodes },
    { data: recentApps },
    { data: recentFamily },
    { data: trafficData },
  ] = await Promise.all([
    supabase.from('RedeemCode').select('*'),
    supabase.from('StreamerApplications').select('*'),
    supabase.from('FamilyApplications').select('*'),
    supabase.from('AdminUsers').select('*', { count: 'exact', head: true }),
    supabase.from('RedeemCode').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('StreamerApplications').select('*').order('created_at', { ascending: false }).limit(4),
    supabase.from('FamilyApplications').select('*').order('created_at', { ascending: false }).limit(4),
    supabase.from('SiteTraffic').select('created_at').gte('created_at', (() => {
      const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString();
    })()),
  ]);

  // Code stats
  const totalCodes    = codes?.length || 0;
  const redeemedCodes = codes?.filter(c => c.isRedeemed).length || 0;
  const activeCodes   = totalCodes - redeemedCodes;
  const tierDistribution = codes?.reduce((acc: any, curr) => {
    acc[curr.tier] = (acc[curr.tier] || 0) + 1;
    return acc;
  }, {}) ?? {};

  // Streamer app stats
  const totalApps   = apps?.length || 0;
  const pendingApps = apps?.filter(a => a.status === 'pending').length || 0;
  const approvedApps = apps?.filter(a => a.status === 'approved').length || 0;

  // Family app stats
  const totalFamilyApps   = familyApps?.length || 0;
  const pendingFamilyApps = familyApps?.filter(a => a.status === 'pending').length || 0;
  const approvedFamilyApps = familyApps?.filter(a => a.status === 'approved').length || 0;

  // Traffic per day (last 7 days)
  const trafficByDay = trafficData?.reduce((acc: any, curr) => {
    const day = new Date(curr.created_at).toLocaleDateString('en-US', { weekday: 'short' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {}) ?? {};

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    last7Days.push({ name: dayName, visitors: trafficByDay[dayName] || 0 });
  }

  return NextResponse.json({
    metrics: {
      totalCodes,
      redeemedCodes,
      activeCodes,
      redemptionRate: totalCodes > 0 ? ((redeemedCodes / totalCodes) * 100).toFixed(1) : 0,
      // Streamer apps
      pendingApps,
      approvedApps,
      totalApps,
      // Family apps
      pendingFamilyApps,
      approvedFamilyApps,
      totalFamilyApps,
      // Staff
      staffCount: staffCount || 0,
    },
    tierDistribution,
    trafficData: last7Days,
    recentActivity: {
      codes:  recentCodes  || [],
      apps:   recentApps   || [],
      family: recentFamily || [],
    },
  });
}
