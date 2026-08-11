import React from "react";
import { StudentSidebar } from "../../components/student/layout/student-sidebar";
import { StudentNavbar } from "../../components/student/layout/student-navbar";
import { requireRoleOrRedirect } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoleOrRedirect("STUDENT");

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
      <StudentSidebar />
      <div className="flex flex-col w-full overflow-hidden">
        <StudentNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
