import { type NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/middleware";

const protectedRoutePatterns = ["/admin", "/faculty", "/student", "/tenant-admin"];

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|landing1.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
