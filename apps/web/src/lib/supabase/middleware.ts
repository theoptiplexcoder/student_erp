import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth/callback',
  '/api/hello',
];

const AUTH_ONLY_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthOnlyPath = AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    // Copy refreshed Supabase cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie);
    });
    return response;
  }

  if (user && isAuthOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/post-login';
    url.search = '';
    const response = NextResponse.redirect(url);
    // Copy refreshed Supabase cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie);
    });
    return response;
  }

  return supabaseResponse;
}
