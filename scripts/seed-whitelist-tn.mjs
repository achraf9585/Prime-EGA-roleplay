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

const TRACK_FILES = [
  "scenarios_track_a_tn.json",
  "scenarios_track_b_tn.json",
  "scenarios_track_c_tn.json",
];

async function seedTranslations() {
  for (const file of TRACK_FILES) {
    const raw = JSON.parse(readFileSync(join(DOWNLOADS, file), "utf8"));
    let ok = 0;
    for (const s of raw.scenarios) {
      const { error } = await supabase
        .from("whitelist_scenarios")
        .update({
          title_tn: s.title,
          scenario_text_tn: s.text,
          targeted_rules_tn: s.targetedRules,
          fail_criteria_tn: s.failCriteria,
          pass_criteria_tn: s.passCriteria,
        })
        .eq("id", s.id);
      if (error) console.error(`  ✗ ${s.id}: ${error.message}`);
      else ok++;
    }
    console.log(`✓ ${file} — ${ok}/${raw.scenarios.length} updated`);
  }
  console.log("Done!");
}

await seedTranslations();
