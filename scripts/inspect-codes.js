
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '../.env');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      env[key] = value;
    }
  });

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  async function inspectCodes() {
    console.log('Inspecting RedeemCode table...');
    
    const { data, error } = await supabase
      .from('RedeemCode')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Error fetching codes:', error);
    } else {
      console.log('Found', data.length, 'rows:');
      console.log(JSON.stringify(data, null, 2));
    }
  }

  inspectCodes();

} catch (err) {
  console.error('Error reading .env or running script:', err.message);
}
