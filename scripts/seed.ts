import { PrismaClient, InstitutionType, UserRole, UserStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY) in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ==========================================
// CONFIGURATION
// Keep this easily changeable in the future
// ==========================================
const SEED_CONFIG = {
  institution: {
    type: InstitutionType.UNIVERSITY,
    legalName: 'Demo Institute of Technology',
    displayName: 'Demo Institute',
    logoUrl: 'https://example.com/logo.png', // Update as needed
  },
  admin: {
    email: 'admin@demo-institute.test',
    password: 'wasdwasd12',
    firstName: 'System',
    lastName: 'Admin',
    phone: '+1234567890',
  },
};

async function seedInstitution() {
  let institution = await prisma.institution.findFirst({
    where: { legalName: SEED_CONFIG.institution.legalName },
  });

  if (!institution) {
    console.log(`Creating institution: ${SEED_CONFIG.institution.legalName}...`);
    institution = await prisma.institution.create({
      data: {
        institutionType: SEED_CONFIG.institution.type,
        legalName: SEED_CONFIG.institution.legalName,
        displayName: SEED_CONFIG.institution.displayName,
        logoUrl: SEED_CONFIG.institution.logoUrl,
      },
    });
    console.log(`Institution created with ID: ${institution.id}`);
  } else {
    console.log(`Institution already exists: ${institution.id}`);
  }

  return institution;
}

async function seedAdmin(institutionId: string) {
  const { email, password, firstName, lastName, phone } = SEED_CONFIG.admin;

  console.log(`Checking Supabase for admin user: ${email}...`);
  let authUserId: string | null = null;

  const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.message.includes('already exists') || createError.status === 422) {
      console.log('User already exists in Supabase. Fetching existing user...');
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        throw new Error(`Failed to list Supabase users: ${listError.message}`);
      }

      const existingUser = usersData.users.find((u) => u.email === email);
      if (!existingUser) {
        throw new Error('User exists but could not be found in user list.');
      }
      authUserId = existingUser.id;
    } else {
      throw new Error(`Failed to create Supabase user: ${createError.message}`);
    }
  } else if (createdUser?.user) {
    console.log('User created in Supabase.');
    authUserId = createdUser.user.id;
  }

  if (!authUserId) {
    throw new Error('Could not resolve Supabase auth user ID.');
  }

  let adminUser = await prisma.user.findUnique({
    where: { authUserId },
  });

  if (!adminUser) {
    const existingByEmail = await prisma.user.findFirst({
      where: { email },
    });

    if (existingByEmail) {
      console.log(`Updating existing Prisma user to map to Supabase auth ID...`);
      adminUser = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { authUserId, role: UserRole.ADMIN, institutionId },
      });
    } else {
      console.log(`Creating admin user in Prisma...`);
      adminUser = await prisma.user.create({
        data: {
          authUserId,
          institutionId,
          email,
          firstName,
          lastName,
          phone,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });
    }
    console.log(`Admin user seeded in Prisma with ID: ${adminUser.id}`);
  } else {
    console.log(`Admin user already exists in Prisma: ${adminUser.id}`);
  }

  return adminUser;
}

async function main() {
  console.log('Starting core seed script...');

  const institution = await seedInstitution();
  const admin = await seedAdmin(institution.id);

  console.log('\nSeed completed successfully.');
  console.log('----------------------------------------------------');
  console.log(`Institution ID : ${institution.id}`);
  console.log(`Admin ID       : ${admin.id}`);
  console.log(`Admin Auth ID  : ${admin.authUserId}`);
  console.log('----------------------------------------------------');
  console.log(
    '\nNOTE: Other domain entities (like courses, programs, sections) should NOT be seeded here.',
  );
  console.log(
    'Use controllers or populate-api.ts for adding data that can be added via the app UI/controllers.',
  );
}

main()
  .catch((e) => {
    console.error('Seed script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
