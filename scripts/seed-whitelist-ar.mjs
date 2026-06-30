import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envFile = readFileSync(join(__dirname, "../.env.local"), "utf8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const [k, ...v] = l.split("=");
      return [k.trim(), v.join("=").trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const DOWNLOADS = "C:/Users/lenovo/Downloads";

const FILES = [
  "questions_category_1_ar.json",
  "questions_category_2_ar.json",
  "questions_category_3_ar.json",
  "questions_category_4_ar.json",
  "questions_category_5_ar.json",
];

async function seedArabic() {
  for (const file of FILES) {
    const raw = JSON.parse(readFileSync(join(DOWNLOADS, file), "utf8"));
    let ok = 0;
    for (const q of raw.questions) {
      const { error } = await supabase
        .from("whitelist_questions")
        .update({
          question_text_ar: q.text,
          options_ar: q.options, // [{ value, text }] — same values as English
        })
        .eq("id", q.id);
      if (error) console.error(`  ✗ ${q.id}: ${error.message}`);
      else ok++;
    }
    console.log(`✓ ${file} — ${ok}/${raw.questions.length} updated`);
  }
  console.log("Done!");
}

await seedArabic();
