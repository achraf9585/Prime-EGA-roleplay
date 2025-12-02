
import { NextResponse } from 'next/server';
// import { redeemCode } from '@/lib/codeStore'; // Legacy CSV method
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Optional: Require login
  if (!session) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code } = await request.json();
   
    
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Query Supabase to verify if the code exists
    const { data: codeRecord, error } = await supabase
      .from('RedeemCode')
      .select('*')
      .eq('codeHash', code.trim())
      .single();

    if (error || !codeRecord) {
      console.log("Code verification failed:", error?.message);
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Code found!
    
    // Capture the reward/tier before deleting
    const tier = codeRecord.tier || codeRecord.reward || 'Standard';

    // Delete the code to prevent reuse
    const { error: deleteError } = await supabase
      .from('RedeemCode')
      .delete()
      .eq('id', codeRecord.id);

    if (deleteError) {
      console.error("Failed to consume code:", deleteError);
      return NextResponse.json({ error: 'Failed to redeem code. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Code redeemed successfully! (${tier})`,
      tier: tier
    });

  } catch (error: any) {
    console.error("Redeem error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
