const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lngxttffwashhvlnknlb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZ3h0dGZmd2FzaGh2bG5rbmxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTgzMjAwOSwiZXhwIjoyMDkxNDA4MDA5fQ.xD_h0uXxLCBCQzG0npEx62dSiRBG_7LC52Xk6vseDAo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  console.log("Wiping dummy traffic...");
  const { error } = await supabase.from('SiteTraffic').delete().not('id', 'is', null);
  if (error) {
    console.error("Error wiping:", error);
  } else {
    console.log("Successfully deleted all SiteTraffic rows!");
  }
}

wipe();
