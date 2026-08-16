const http = require('http');

async function main() {
  const API_URL = 'http://localhost:3333/api';

  console.log('Authenticating...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@demo-institute.test', password: 'wasdwasd12' }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.error('Login failed:', text);
    // If the endpoint doesn't exist, we might need a workaround for auth.
    // The NestJS app might not have auth/login if it relies purely on Supabase.
    console.log(
      'Will check if we can get a Supabase token or if we should skip API population and rely on seed.ts.',
    );
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.access_token || loginData.token || loginData.session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Rest of population logic...
}

main().catch(console.error);
