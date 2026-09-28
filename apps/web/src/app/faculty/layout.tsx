import React from 'react';
import { requireRoleOrRedirect } from '@/lib/auth';
import { RoleBottomNav } from '@/components/layout/role-bottom-nav';
import { FacultySidebar } from '../../components/faculty/layout/faculty-sidebar';
import { FacultyNavbar } from '../../components/faculty/layout/faculty-navbar';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect('FACULTY');

  return (
    <div className="bg-background flex h-screen overflow-hidden antialiased">
      <FacultySidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <FacultyNavbar />
        <main className="bg-background flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        <RoleBottomNav role="faculty" />
      </div>
    </div>
  );
}
