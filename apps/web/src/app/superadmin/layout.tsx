import { requireRoleOrRedirect } from '@/lib/auth';
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
        <main className="bg-background/50 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
