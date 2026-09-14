import React from 'react';
import { StudentSidebar } from '../../components/student/layout/student-sidebar';
import { StudentNavbar } from '../../components/student/layout/student-navbar';
import { StudentMobileNav } from '../../components/student/layout/student-mobile-nav';
import { requireRoleOrRedirect } from '@/lib/auth';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect('STUDENT');

  return (
    <div className="bg-background flex min-h-screen w-full flex-col pb-16 antialiased md:flex-row md:pb-0">
      <StudentSidebar />
      <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
        <StudentNavbar />
        <main className="bg-background flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
      <StudentMobileNav />
    </div>
  );
}
