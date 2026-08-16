import React from 'react';
import { StudentSidebar } from '../../components/student/layout/student-sidebar';
import { StudentNavbar } from '../../components/student/layout/student-navbar';
import { requireRoleOrRedirect } from '@/lib/auth';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect('STUDENT');

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
      <StudentSidebar />
      <div className="flex w-full flex-col overflow-hidden">
        <StudentNavbar />
        <main className="bg-muted/20 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
