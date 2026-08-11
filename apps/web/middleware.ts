import { NextResponse, type NextRequest } from "next/server";
// import { updateSession } from "./src/lib/supabase/middleware";

// const protectedRoutePatterns = ["/admin", "/faculty", "/student", "/tenant-admin"];

/*
 * ============================================================================
 * MIDDLEWARE TEMPORARILY DISABLED
 * ============================================================================
 * 
 * To re-enable the middleware:
 * 1. Uncomment the `updateSession` import at the top of this file.
 * 2. Uncomment the `protectedRoutePatterns` variable (if needed).
 * 3. Remove or comment out `return NextResponse.next();` below.
 * 4. Uncomment `return await updateSession(request);`.
 */

export async function middleware(request: NextRequest) {
  // 🔴 TEMPORARILY DISABLED: Returning next() immediately bypasses authentication checks.
  return NextResponse.next();
  
  // 🟢 TO ENABLE: Uncomment the line below and remove the NextResponse.next() above.
  // return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|landing1.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
