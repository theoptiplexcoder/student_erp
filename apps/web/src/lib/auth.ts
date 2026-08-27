import { redirect, unauthorized, forbidden } from 'next/navigation';
import { createClient } from './supabase/server';

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
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  // Instead of querying the database directly using Prisma and creating duplicate connections,
  // we centralize database access by proxying to the NestJS API which securely resolves the user
  // role based on the provided auth token.
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      next: {
        revalidate: 0, // Avoid caching stale user data across sessions
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.user || null;
  } catch (error) {
    console.error('Failed to fetch user from API:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  if (user.status !== 'ACTIVE') {
    forbidden();
  }

  return user;
}

export async function requireRole(...roles: string[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    forbidden();
  }

  return user;
}

// Server-component guard: redirects to /login when unauthenticated and returns forbidden
// when they lack one of the allowed roles.
export async function requireRoleOrRedirect(...roles: string[]): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.status !== 'ACTIVE') {
    forbidden();
  }

  if (!roles.includes(user.role)) {
    forbidden();
  }

  return user;
}
