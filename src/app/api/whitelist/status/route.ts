import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const discordId = (session.user as any).id || session.user.email;

  const { data, error } = await supabase
    .from("whitelist_applications")
    .select("id, status, admin_notes, rejected_at, created_at, quiz_score, faction_choice")
    .eq("discord_id", discordId)
    .single();

  if (error || !data) {
    return NextResponse.json({ status: "none" });
  }

  return NextResponse.json(data);
}
