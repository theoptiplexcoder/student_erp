import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { requireRoleOrRedirect } from "@/lib/auth";

export default async function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoleOrRedirect("ADMIN");

  return <AppLayout>{children}</AppLayout>;
}
