import { redirect, unauthorized, forbidden } from 'next/navigation';
import { cache } from 'react';
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

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();

  // Validate the token against Supabase's server and refresh if needed.
  // getSession() returns tokens from cookies without validation — they may be expired.
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  // Get the (now refreshed) session to extract the access_token for the NestJS API
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
    const apiUrl = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000';
    const baseUrl = apiUrl.endsWith('/api/v1') ? apiUrl : `${apiUrl.replace(/\/$/, '')}/api/v1`;
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      next: {
        revalidate: 0, // Avoid caching stale user data across sessions
      },
    });

    if (!res.ok) {
      console.error('API /auth/me returned not ok:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.user || null;
  } catch (error) {
    console.error('Failed to fetch user from API:', error);
    return null;
  }
});

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
