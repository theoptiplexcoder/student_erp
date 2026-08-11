import React from "react";
import { requireRoleOrRedirect } from "@/lib/auth";

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoleOrRedirect("FACULTY");

  return <>{children}</>;
}
