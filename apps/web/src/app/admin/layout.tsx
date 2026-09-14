import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { requireRoleOrRedirect } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect('ADMIN');

  return (
    <div className="bg-background flex h-screen overflow-hidden antialiased">
      <AdminSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="bg-background flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
