import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  // Rate limit public quiz fetch (20 / 10 min / IP)
  const rl = rateLimit(`wl-questions:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch 4 random questions from each of the 5 categories
  const allQuestions: any[] = [];
  for (let cat = 1; cat <= 5; cat++) {
    const { data, error } = await supabase
      .from("whitelist_questions")
      .select("id, category_number, category_name, question_text, options, question_text_ar, options_ar")
      .eq("category_number", cat);
    if (error || !data) continue;
    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 4);
    allQuestions.push(...shuffled);
  }
  // Shuffle final 20 questions
  const final = allQuestions.sort(() => Math.random() - 0.5);
  return NextResponse.json(final);
}
