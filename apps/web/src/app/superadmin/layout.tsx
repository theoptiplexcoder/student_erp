import { requireRoleOrRedirect } from '@/lib/auth';
import { RoleBottomNav } from '@/components/layout/role-bottom-nav';
import { SuperadminSidebar } from '@/components/superadmin/superadmin-sidebar';
import { SuperadminHeader } from '@/components/superadmin/superadmin-header';

export const dynamic = 'force-dynamic';

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRoleOrRedirect('SUPERADMIN');

  return (
    <div className="bg-background text-foreground flex h-screen overflow-hidden antialiased">
      <SuperadminSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <SuperadminHeader
          userEmail={user.email}
          userName={`${user.firstName} ${user.lastName}`.trim()}
        />
        <main className="bg-background/50 flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
        <RoleBottomNav role="superadmin" />
      </div>
    </div>
  );
}
