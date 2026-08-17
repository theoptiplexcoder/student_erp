import { redirect, unauthorized, forbidden } from 'next/navigation';
import { createClient } from './supabase/server';
import { prisma } from './prisma';

export interface AuthUser {
  id: string;
  authUserId: string;
  institutionId: string;
  role: string;
  status: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'FACULTY':
      return '/faculty/dashboard';
    case 'STUDENT':
      return '/student';
    default:
      return '/';
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { authUserId: supabaseUser.id },
    select: {
      id: true,
      authUserId: true,
      institutionId: true,
      role: true,
      status: true,
      email: true,
      firstName: true,
      lastName: true,
      photoUrl: true,
    },
  });

  if (!dbUser) {
    return null;
  }

  return {
    id: dbUser.id,
    authUserId: dbUser.authUserId,
    institutionId: dbUser.institutionId,
    role: dbUser.role,
    status: dbUser.status,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    photoUrl: dbUser.photoUrl,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (user.status !== 'ACTIVE') {
    throw new Error('FORBIDDEN: Account inactive');
  }

  return user;
}

export async function requireRole(...roles: string[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

// Server-component guard: redirects to /login when unauthenticated and returns forbidden
// when they lack one of the allowed roles.
export async function requireRoleOrRedirect(...roles: string[]): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user || user.status !== 'ACTIVE') {
    redirect('/login');
  }

  if (!roles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}
