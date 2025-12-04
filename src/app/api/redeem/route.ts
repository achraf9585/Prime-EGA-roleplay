
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

    // Check if code is already redeemed
    if (codeRecord.isRedeemed) {
      return NextResponse.json({ error: 'Code has already been redeemed' }, { status: 400 });
    }

    // Code found and valid!
    
    // Capture the reward/tier
    // Capture the reward/tier
    let tier = codeRecord.tier || codeRecord.reward || 'Standard';
    
    // If rewardType exists (e.g. "Prime-EGA-Gold"), try to extract the tier from it
    if (codeRecord.rewardType) {
      const parts = codeRecord.rewardType.split('-');
      if (parts.length > 0) {
        tier = parts[parts.length - 1]; // Get the last part (e.g. "Gold")
      }
    }

    // Update the code record to mark it as redeemed
    const { error: updateError } = await supabase
      .from('RedeemCode')
      .update({
        isRedeemed: true,
        redeemedBy: session.user.id || session.user.email, // Use Discord ID if available, fallback to email
        redeemedAt: new Date().toISOString()
      })
      .eq('id', codeRecord.id);

    if (updateError) {
      console.error("Failed to redeem code:", updateError);
      return NextResponse.json({ error: 'Failed to redeem code. Please try again.' }, { status: 500 });
    }

    // Attempt to assign Discord Role
    try {
      const guildId = process.env.DISCORD_GUILD_ID;
      const botToken = process.env.DISCORD_BOT_TOKEN;
      
      // Determine Role ID based on tier
      // Explicit mapping to ensure we match the environment variables correctly
      const roleMap: Record<string, string | undefined> = {
        'Bronze': process.env.DISCORD_ROLE_ID_BRONZE,
        'Silver': process.env.DISCORD_ROLE_ID_SILVER,
        'Gold': process.env.DISCORD_ROLE_ID_GOLD,
        'Platinum': process.env.DISCORD_ROLE_ID_PLATINUM,
        'Diamond': process.env.DISCORD_ROLE_ID_DIAMOND,
        'Prime': process.env.DISCORD_ROLE_ID_PRIME,
        'Elite': process.env.DISCORD_ROLE_ID_ELITE,
        'Ruby': process.env.DISCORD_ROLE_ID_RUBY,
        'Ultimate': process.env.DISCORD_ROLE_ID_ULTIMATE,
      };

      // Normalize tier name to Title Case for lookup (e.g. "bronze" -> "Bronze")
      const normalizedTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
      const roleId = roleMap[normalizedTier] || process.env[`DISCORD_ROLE_ID_${tier.toUpperCase().replace(/\s+/g, '_')}`];

      console.log(`[DEBUG] Tier: ${tier}, Normalized: ${normalizedTier}, Role ID: ${roleId}`);
      console.log(`[DEBUG] Guild ID: ${guildId ? 'Set' : 'Missing'}, Bot Token: ${botToken ? 'Set' : 'Missing'}, User ID: ${session.user.id}`);

      if (guildId && botToken && roleId && session.user.id) {
        console.log(`Attempting to assign role ${roleId} to user ${session.user.id} for tier ${tier}`);
        
        const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${session.user.id}/roles/${roleId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error(`Failed to assign role. Status: ${response.status}`, await response.text());
        } else {
          console.log(`Successfully assigned role ${roleId} to user ${session.user.id}`);
        }
      } else {
        console.log(`Skipping Discord role assignment. Missing config or role ID for tier: ${tier}`);
        if (!roleId) console.log(`Expected Env Var: DISCORD_ROLE_ID_${normalizedTier.toUpperCase()}`);
      }
    } catch (err) {
      console.error("Error assigning Discord role:", err);
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
