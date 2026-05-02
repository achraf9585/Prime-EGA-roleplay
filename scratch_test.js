const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lngxttffwashhvlnknlb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ3h0dGZmd2FzaGh2bG5rbmxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzMjAwOSwiZXhwIjoyMDkxNDA4MDA5fQ.xD_h0uXxLCBCQzG0npEx62dSiRBG_7LC52Xk6vseDAo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log("\n--- 1. Fetching sample rows ---");
  const { data: sample, error: sampleErr } = await supabase.from('SiteTraffic').select('*').limit(5);
  if (sampleErr) {
    console.error("Select error:", sampleErr.message);
  } else if (sample.length === 0) {
    console.log("Table is EMPTY.");
  } else {
    console.log("Sample rows:", JSON.stringify(sample, null, 2));
    console.log("Columns:", Object.keys(sample[0]).join(', '));
  }

  console.log("\n--- 2. Inserting test row WITH country ---");
  const { error: insertErr } = await supabase.from('SiteTraffic').insert([{ page_path: '/diag', country: 'TN' }]);
  if (insertErr) {
    console.error("❌ Insert FAILED:", insertErr.message);
    console.log("\n⚠️  You need to run this SQL in Supabase:");
    console.log('   ALTER TABLE "SiteTraffic" ADD COLUMN country text DEFAULT \'Unknown\';');
  } else {
    console.log("✅ Insert with country succeeded!");
  }

  console.log("\n--- 3. Total row count ---");
  const { count } = await supabase.from('SiteTraffic').select('*', { count: 'exact', head: true });
  console.log("Total rows:", count);
}

diagnose();
