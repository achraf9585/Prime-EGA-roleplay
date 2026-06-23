import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ role: null });

  const discordId = (session.user as any).id;
  const { data } = await supabase
    .from("whitelist_staff")
    .select("role")
    .eq("discord_id", discordId)
    .single();

  return NextResponse.json({ role: data?.role ?? null });
}
