const axios = require('axios');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8')
      .split('\n')
      .forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) return;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        env[key] = value;
      });
  }
  return env;
}

async function seed() {
  const env = loadEnv();
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  try {
    const authRes = await axios.post(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        email: 'admin@demo-institute.test',
        password: 'wasdwasd12',
      },
      {
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
      },
    );

    const token = authRes.data.access_token;

    const seedRes = await axios.post(
      'http://localhost:4000/api/v1/admin/demo/seed-student-portal',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    console.log(JSON.stringify(seedRes.data, null, 2));
  } catch (err) {
    console.error('Error seeding data:', err.response?.data || err.message);
  }
}

seed();
