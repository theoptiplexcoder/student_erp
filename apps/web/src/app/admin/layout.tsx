import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { requireRoleOrRedirect } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleOrRedirect('ADMIN');

  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden antialiased">
      <AdminSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="bg-background/50 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
