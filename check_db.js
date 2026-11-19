const fs = require('fs');
const env = fs.readFileSync('d:/News_Site/.env.local', 'utf8');
const lines = env.split('\n');
const envVars = {};
lines.forEach(l => {
  const parts = l.split('=');
  const k = parts[0]?.trim();
  const v = parts.slice(1).join('=').trim().replace(/['"]/g, '');
  if (k && v) envVars[k] = v;
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // Let's check if there are any other columns in articles or functions
  const { data, error } = await supabase.from('articles').select('*').limit(1);
  console.log('Columns:', Object.keys(data[0] || {}));
}
check();
