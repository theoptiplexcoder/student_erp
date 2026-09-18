import { redirect, unauthorized, forbidden } from 'next/navigation';
import { cache } from 'react';
import { createClient } from './supabase/server';

export interface AuthUser {
  id: string;
  authUserId: string;
  institutionId?: string | null;
  role: string;
  status: string;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  institution?: {
    id: string;
    legalName: string;
    displayName: string;
    status?: string;
  } | null;
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case 'SUPERADMIN':
      return '/superadmin';
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

  // Next.js middleware has already validated and refreshed the session on the request.
  // We first inspect getSession() from cookies directly to avoid a redundant remote HTTPS hop
  // to Supabase on every RSC render/page reload. If missing or expired, we fall back to getUser().
  let sessionToken: string | null = null;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    sessionToken = session.access_token;
  } else {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    const {
      data: { session: refreshedSession },
    } = await supabase.auth.getSession();
    sessionToken = refreshedSession?.access_token ?? null;
  }

  if (!sessionToken) {
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
        Authorization: `Bearer ${sessionToken}`,
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

  if (user.status === 'PENDING_APPROVAL') {
    redirect('/pending-approval');
  }

  if (user.status === 'REJECTED') {
    redirect('/access-denied?reason=rejected');
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

  if (user.status === 'PENDING_APPROVAL') {
    redirect('/pending-approval');
  }

  if (user.status === 'REJECTED') {
    redirect('/access-denied?reason=rejected');
  }

  if (user.status !== 'ACTIVE') {
    forbidden();
  }

  if (!roles.includes(user.role)) {
    forbidden();
  }

  return user;
}
