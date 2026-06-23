import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — list all whitelist staff (admin only)
export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase
    .from("whitelist_staff")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST — add whitelist staff member (admin only)
export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { discord_id, discord_username, role } = await req.json();
  if (!discord_id || !discord_username || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("whitelist_staff")
    .upsert({ discord_id, discord_username, role }, { onConflict: "discord_id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove whitelist staff member (admin only)
export async function DELETE(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await supabase.from("whitelist_staff").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
