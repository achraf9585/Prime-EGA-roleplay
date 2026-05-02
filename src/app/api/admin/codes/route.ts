import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server';
import { isAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('RedeemCode')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code, tier, count } = await request.json();

    if (!tier) {
      return NextResponse.json({ error: 'Tier is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Bulk generation mode
    if (count && typeof count === 'number' && count > 0) {
      const codesToInsert = [];
      const usedPrefix = code || 'EGA';
      
      for (let i = 0; i < count; i++) {
        const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
        codesToInsert.push({
          codeHash: `${usedPrefix}-${tier.toUpperCase()}-${randomString}`,
          tier,
          isRedeemed: false,
          created_at: new Date().toISOString()
        });
      }

      const { data, error } = await supabase
        .from('RedeemCode')
        .insert(codesToInsert)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }

    // Single code mode
    if (!code) {
      return NextResponse.json({ error: 'Code is required for single generation' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('RedeemCode')
      .insert([
        { 
          codeHash: code.trim(), 
          tier, 
          isRedeemed: false,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('RedeemCode')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
