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
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BASE = "C:/Users/lenovo/Downloads/silly-einstein/silly-einstein";

const CATEGORIES = [
  { file: "questions_category_1.json", number: 1, name: "General Conduct & Immersion" },
  { file: "questions_category_2.json", number: 2, name: "Core Roleplay Mechanics" },
  { file: "questions_category_3.json", number: 3, name: "Character Identity & Realism" },
  { file: "questions_category_4.json", number: 4, name: "Criminal, Economy & Faction Limits" },
  { file: "questions_category_5.json", number: 5, name: "Server Specific Systems" },
];

const SCENARIO_TRACKS = [
  { file: "scenarios_track_a.json", track: "a", name: "Corporate & Financial Factions" },
  { file: "scenarios_track_b.json", track: "b", name: "EMS / Medical Personnel" },
  { file: "scenarios_track_c.json", track: "c", name: "Law Enforcement / Police" },
];

async function seedQuestions() {
  console.log("Seeding questions...");
  for (const cat of CATEGORIES) {
    const raw = JSON.parse(readFileSync(join(BASE, cat.file), "utf8"));
    const rows = raw.questions.map((q) => ({
      id: q.id,
      category_number: cat.number,
      category_name: cat.name,
      question_text: q.text,
      options: q.options,
      correct_answer: q.correct,
    }));
    const { error } = await supabase
      .from("whitelist_questions")
      .upsert(rows, { onConflict: "id" });
    if (error) console.error(`Category ${cat.number} error:`, error.message);
    else console.log(`  ✓ Category ${cat.number} — ${rows.length} questions`);
  }
}

async function seedScenarios() {
  console.log("Seeding scenarios...");
  for (const t of SCENARIO_TRACKS) {
    const raw = JSON.parse(readFileSync(join(BASE, t.file), "utf8"));
    const rows = raw.scenarios.map((s) => ({
      id: s.id,
      track: t.track,
      track_name: t.name,
      title: s.title,
      scenario_text: s.text,
      targeted_rules: s.targetedRules,
      fail_criteria: s.failCriteria,
      pass_criteria: s.passCriteria,
    }));
    const { error } = await supabase
      .from("whitelist_scenarios")
      .upsert(rows, { onConflict: "id" });
    if (error) console.error(`Track ${t.track} error:`, error.message);
    else console.log(`  ✓ Track ${t.track.toUpperCase()} — ${rows.length} scenarios`);
  }
}

await seedQuestions();
await seedScenarios();
console.log("Done!");
