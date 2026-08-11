import { createClient } from "./supabase/server";
import { prisma } from "./prisma";

export interface AuthUser {
  id: string;
  authUserId: string;
  institutionId: string;
  role: string;
  status: string;
  email: string;
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
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("ACCOUNT_INACTIVE");
  }

  return user;
}

export async function requireRole(...roles: string[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
