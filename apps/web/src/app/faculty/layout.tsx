import React from 'react';
import { requireRoleOrRedirect } from '@/lib/auth';
import { FacultySidebar } from '../../components/faculty/layout/faculty-sidebar';
import { FacultyNavbar } from '../../components/faculty/layout/faculty-navbar';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect('FACULTY');

  return (
    <div className="flex h-screen overflow-hidden">
      <FacultySidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <FacultyNavbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
