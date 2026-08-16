import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const API_URL = 'http://localhost:3333/api';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not found in env.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('Logging in to Supabase...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@demo-institute.test',
    password: 'wasdwasd12',
  });

  if (authError || !authData.session) {
    console.error('Failed to log in:', authError);
    return;
  }

  const token = authData.session.access_token;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  console.log('Successfully authenticated. Token acquired.');

  // Fetch Institution
  const instRes = await fetch(`${API_URL}/admin/institution/profile`, { headers });
  const institution = await instRes.json();
  console.log(`Institution ID: ${institution.id}`);

  // Fetch Programs
  const progRes = await fetch(`${API_URL}/admin/programs`, { headers });
  const programsData = await progRes.json();
  const programs = programsData.data || [];
  console.log(`Found ${programs.length} programs.`);

  const btechCse = programs.find((p: any) => p.code === 'BTECH-CSE');
  const btechIt = programs.find((p: any) => p.code === 'BTECH-IT');
  const btechEce = programs.find((p: any) => p.code === 'BTECH-ECE');
  const bca = programs.find((p: any) => p.code === 'BCA');

  // 1. Create Courses
  const coursesToCreate = [
    { code: 'CS102-DS', name: 'Data Structures', programId: btechCse?.id },
    { code: 'CS201-DBMS', name: 'Database Management Systems', programId: btechCse?.id },
    { code: 'CS202-OS', name: 'Operating Systems', programId: btechCse?.id },
    { code: 'CS203-CN', name: 'Computer Networks', programId: btechCse?.id },
    { code: 'CS103-OOP', name: 'Object Oriented Programming', programId: btechCse?.id },
    { code: 'CS205-SE', name: 'Software Engineering', programId: btechCse?.id },

    { code: 'IT208-WT', name: 'Web Technologies', programId: btechIt?.id },
    { code: 'IT309-DA', name: 'Data Analytics', programId: btechIt?.id },
    { code: 'IT203-CN', name: 'Computer Networks', programId: btechIt?.id },
    { code: 'IT201-DBMS', name: 'Database Systems', programId: btechIt?.id },

    { code: 'EC102-DE', name: 'Digital Electronics', programId: btechEce?.id },
    { code: 'EC201-SS', name: 'Signals and Systems', programId: btechEce?.id },
    { code: 'EC209-MP', name: 'Microprocessors', programId: btechEce?.id },
    { code: 'EC204-CS', name: 'Communication Systems', programId: btechEce?.id },
  ];

  for (const c of coursesToCreate) {
    if (!c.programId) continue;
    const res = await fetch(`${API_URL}/admin/courses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        institutionId: institution.id,
        code: c.code,
        name: c.name,
        programId: c.programId,
        creditValue: 4,
      }),
    });
    const result = await res.json();
    if (res.ok) console.log(`Created course: ${c.name}`);
    else console.log(`Course creation failed or already exists: ${c.name} -`, result.message);
  }

  // 2. Create Batches
  const currentYear = new Date().getFullYear();
  const batchesToCreate = [
    {
      name: `${currentYear} CSE Batch A`,
      admissionYear: currentYear,
      programId: btechCse?.id,
      key: 'cse-a',
    },
    {
      name: `${currentYear} CSE Batch B`,
      admissionYear: currentYear,
      programId: btechCse?.id,
      key: 'cse-b',
    },
    {
      name: `${currentYear} IT Batch A`,
      admissionYear: currentYear,
      programId: btechIt?.id,
      key: 'it-a',
    },
    {
      name: `${currentYear} IT Batch B`,
      admissionYear: currentYear,
      programId: btechIt?.id,
      key: 'it-b',
    },
    {
      name: `${currentYear} ECE Batch A`,
      admissionYear: currentYear,
      programId: btechEce?.id,
      key: 'ece-a',
    },
    {
      name: `${currentYear} BCA Batch A`,
      admissionYear: currentYear,
      programId: bca?.id,
      key: 'bca-a',
    },
  ];

  const batchMap: any = {};
  for (const b of batchesToCreate) {
    if (!b.programId) continue;
    const res = await fetch(`${API_URL}/admin/batches`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        institutionId: institution.id,
        programId: b.programId,
        name: b.name,
        admissionYear: b.admissionYear,
        startDate: `${currentYear}-08-01`,
        expectedEndDate: `${currentYear + 4}-06-30`,
      }),
    });
    const result = await res.json();
    if (res.ok) {
      console.log(`Created batch: ${b.name}`);
      batchMap[b.key] = result.id;
    } else {
      console.log(`Batch creation failed or already exists: ${b.name} -`, result.message);
      // Fetch batch to get ID if it exists
      const existingRes = await fetch(
        `${API_URL}/admin/batches?programId=${b.programId}&search=${encodeURIComponent(b.name)}`,
        { headers },
      );
      const existing = await existingRes.json();
      if (existing.data && existing.data.length > 0) {
        batchMap[b.key] = existing.data[0].id;
      }
    }
  }

  // Fetch current academic year
  const ayRes = await fetch(`${API_URL}/admin/institution/academic-years`, { headers });
  const ayData = await ayRes.json();
  const currentAy = ayData.find((ay: any) => ay.isActive);

  // 3. Create Sections
  const sectionsToCreate = [
    {
      name: 'Section A',
      code: 'SEC-A-CSE-A',
      capacity: 60,
      batchKey: 'cse-a',
      programId: btechCse?.id,
    },
    {
      name: 'Section B',
      code: 'SEC-B-CSE-A',
      capacity: 60,
      batchKey: 'cse-a',
      programId: btechCse?.id,
    },
    {
      name: 'Section A',
      code: 'SEC-A-CSE-B',
      capacity: 60,
      batchKey: 'cse-b',
      programId: btechCse?.id,
    },
    {
      name: 'Section B',
      code: 'SEC-B-CSE-B',
      capacity: 60,
      batchKey: 'cse-b',
      programId: btechCse?.id,
    },
    {
      name: 'Section A',
      code: 'SEC-A-IT-A',
      capacity: 60,
      batchKey: 'it-a',
      programId: btechIt?.id,
    },
    {
      name: 'Section B',
      code: 'SEC-B-IT-A',
      capacity: 60,
      batchKey: 'it-a',
      programId: btechIt?.id,
    },
    {
      name: 'Section A',
      code: 'SEC-A-ECE-A',
      capacity: 60,
      batchKey: 'ece-a',
      programId: btechEce?.id,
    },
    { name: 'Section A', code: 'SEC-A-BCA-A', capacity: 60, batchKey: 'bca-a', programId: bca?.id },
  ];

  for (const s of sectionsToCreate) {
    if (!batchMap[s.batchKey] || !s.programId || !currentAy) continue;
    const res = await fetch(`${API_URL}/admin/sections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        institutionId: institution.id,
        programId: s.programId,
        batchId: batchMap[s.batchKey],
        academicYearId: currentAy.id,
        name: s.name,
        code: s.code,
        capacity: s.capacity,
      }),
    });
    const result = await res.json();
    if (res.ok) console.log(`Created section: ${s.name} for ${s.batchKey}`);
    else console.log(`Section creation failed or already exists: ${s.name} -`, result.message);
  }

  console.log('Done!');
}

main().catch(console.error);
