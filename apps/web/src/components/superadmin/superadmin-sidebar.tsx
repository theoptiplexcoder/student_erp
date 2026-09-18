'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  Building2,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@student-erp/ui';
import { useOnboardingRequests } from '@/hooks/api/superadmin/useSuperadminOnboarding';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  showPendingBadge?: boolean;
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/superadmin',
    icon: LayoutDashboard,
  },
  {
    title: 'Onboarding Requests',
    href: '/superadmin/onboarding',
    icon: UserCheck,
    showPendingBadge: true,
  },
  {
    title: 'Institutions',
    href: '/superadmin/institutions',
    icon: Building2,
  },
];

export function SuperadminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: pendingRequests } = useOnboardingRequests('PENDING');

  const pendingCount = pendingRequests?.length || 0;

  const NavContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="border-border flex items-center gap-3 border-b px-4 py-5">
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl font-bold shadow-xs">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-foreground text-sm font-bold tracking-tight">Platform Admin</h2>
            <p className="text-muted-foreground text-xs">Tenant Operations</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/superadmin' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </div>
                {item.showPendingBadge && pendingCount > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-bold transition-colors',
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                    )}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-border border-t p-4">
        <div className="bg-muted/50 text-muted-foreground rounded-lg p-3 text-xs">
          <p className="text-foreground font-medium">Superadmin Portal</p>
          <p className="mt-0.5">Manage institutions & multi-tenant provisioning.</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-3 left-4 z-50 md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-card text-foreground border-border rounded-lg border p-2 shadow-sm"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="border-border bg-card hidden w-64 shrink-0 border-r md:block">
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="bg-background/80 fixed inset-0 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="border-border bg-card fixed inset-y-0 left-0 z-50 w-72 border-r shadow-2xl">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
