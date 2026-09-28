'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BookOpen,
  Building2,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@student-erp/utils';

type Role = 'admin' | 'faculty' | 'superadmin';

const navItems = {
  admin: [
    { label: 'Home', href: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Timetable', href: '/admin/timetable', icon: CalendarDays },
    { label: 'Faculty', href: '/admin/faculty', icon: BookOpen },
  ],
  faculty: [
    { label: 'Home', href: '/faculty/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Timetable', href: '/faculty/timetable', icon: CalendarDays },
    { label: 'Courses', href: '/faculty/courses', icon: BookOpen },
    { label: 'Students', href: '/faculty/students', icon: Users },
  ],
  superadmin: [
    { label: 'Home', href: '/superadmin', icon: LayoutDashboard, exact: true },
    { label: 'Requests', href: '/superadmin/onboarding', icon: ClipboardList },
    { label: 'Institutions', href: '/superadmin/institutions', icon: Building2 },
  ],
} satisfies Record<
  Role,
  Array<{ label: string; href: string; icon: typeof LayoutDashboard; exact?: boolean }>
>;

export function RoleBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Quick navigation"
      className="bg-card/95 border-border fixed inset-x-0 bottom-0 z-40 border-t px-2 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-[0_-4px_16px_rgba(15,23,42,0.04)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems[role].map(({ label, href, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[11px] font-medium transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {active && (
                <span className="bg-primary absolute -top-2 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full" />
              )}
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
