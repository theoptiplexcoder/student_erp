const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const API_URL = 'http://localhost:4000/api/v1';

async function main() {
  console.log('Logging in as admin...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@demo-institute.test',
    password: 'wasdwasd12',
  });

  if (error) {
    console.error('Login failed:', error.message);
    process.exit(1);
  }

  const token = data.session.access_token;
  console.log('Logged in successfully. Fetching student1...');

  try {
    const res = await axios.get(`${API_URL}/admin/students?search=student1`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const students = res.data.data;
    if (!students || students.length === 0) {
      console.error('Student1 not found');
      process.exit(1);
    }

    const student = students.find((s) => s.user.email === 'student1@demo-institute.test');
    if (!student) {
      console.error('Student1 email not matched in results');
      process.exit(1);
    }

    console.log(`Found student1 with ID: ${student.id}`);
    console.log('Updating student profile...');

    const updateData = {
      dateOfBirth: '2001-05-15T00:00:00Z',
      gender: 'MALE',
      phone: '+1 555-0198',
      address: '123 University Ave, Apt 4B',
      city: 'Boston',
      state: 'MA',
      postalCode: '02115',
      country: 'USA',
      guardianName: 'Robert Smith',
      guardianPhone: '+1 555-0199',
    };

    await axios.patch(`${API_URL}/admin/students/${student.id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Successfully updated student1 profile with mock data via Admin API.');
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
}

main().catch(console.error);
