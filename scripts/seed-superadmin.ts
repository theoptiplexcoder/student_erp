import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Missing Supabase credentials: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env',
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const SUPERADMIN_CONFIG = {
  email: 'vebron@tutamail.com',
  password: 'Wasdwasd123!',
  firstName: 'Super',
  lastName: 'Admin',
};

async function seedSuperadmin() {
  console.log('🚀 Seeding Superadmin account...');
  console.log(`Email: ${SUPERADMIN_CONFIG.email}`);

  let authUserId: string | null = null;

  // 1. Check if user already exists in Supabase Auth
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to query Supabase users:', listError.message);
    process.exit(1);
  }

  const existingAuthUser = userList.users.find(
    (u) => u.email?.toLowerCase() === SUPERADMIN_CONFIG.email.toLowerCase(),
  );

  if (existingAuthUser) {
    authUserId = existingAuthUser.id;
    console.log(`ℹ️  Found existing Supabase auth user (id: ${authUserId}). Updating password...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUserId, {
      password: SUPERADMIN_CONFIG.password,
      email_confirm: true,
      user_metadata: {
        firstName: SUPERADMIN_CONFIG.firstName,
        lastName: SUPERADMIN_CONFIG.lastName,
        role: UserRole.SUPERADMIN,
      },
    });

    if (updateError) {
      console.error('❌ Failed to update Supabase password:', updateError.message);
      process.exit(1);
    }
  } else {
    console.log('✨ Creating new user in Supabase Auth...');
    const { data: createdAuthUser, error: createError } = await supabase.auth.admin.createUser({
      email: SUPERADMIN_CONFIG.email,
      password: SUPERADMIN_CONFIG.password,
      email_confirm: true,
      user_metadata: {
        firstName: SUPERADMIN_CONFIG.firstName,
        lastName: SUPERADMIN_CONFIG.lastName,
        role: UserRole.SUPERADMIN,
      },
    });

    if (createError || !createdAuthUser.user) {
      console.error('❌ Failed to create Supabase user:', createError?.message);
      process.exit(1);
    }

    authUserId = createdAuthUser.user.id;
  }

  // 2. Upsert into application database (Prisma)
  console.log('💾 Upserting user in application database...');
  const dbUser = await prisma.user.upsert({
    where: { authUserId },
    update: {
      email: SUPERADMIN_CONFIG.email.toLowerCase(),
      firstName: SUPERADMIN_CONFIG.firstName,
      lastName: SUPERADMIN_CONFIG.lastName,
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      institutionId: null, // Platform-level superadmin belongs to no specific institution
    },
    create: {
      authUserId,
      email: SUPERADMIN_CONFIG.email.toLowerCase(),
      firstName: SUPERADMIN_CONFIG.firstName,
      lastName: SUPERADMIN_CONFIG.lastName,
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      institutionId: null,
    },
  });

  console.log('✅ Superadmin successfully seeded!');
  console.log({
    id: dbUser.id,
    authUserId: dbUser.authUserId,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.status,
    institutionId: dbUser.institutionId,
  });
}

seedSuperadmin()
  .catch((err) => {
    console.error('❌ Unexpected error during superadmin seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
