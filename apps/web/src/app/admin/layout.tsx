import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { requireRoleOrRedirect } from '@/lib/auth';
import { RoleBottomNav } from '@/components/layout/role-bottom-nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect('ADMIN');

  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden antialiased">
      <AdminSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="bg-background/50 flex-1 overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-6 lg:p-8">
          {children}
        </main>
        <RoleBottomNav role="admin" />
      </div>
    </div>
  );
}
