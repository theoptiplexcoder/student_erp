'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  ClipboardCheck,
  FileText,
  Users,
  Megaphone,
  CalendarDays,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CalendarOff,
} from 'lucide-react';
import { cn } from '@student-erp/utils';
import { useSidebarStore } from '@/hooks/use-sidebar';
import { Button } from '@student-erp/ui';

export const facultySidebarNavItems = [
  { title: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard, exact: true },
  { title: 'Timetable', href: '/faculty/timetable', icon: CalendarCheck },
  { title: 'Courses', href: '/faculty/courses', icon: BookOpen },
  { title: 'My Sections', href: '/faculty/sections', icon: ClipboardCheck },
  { title: 'Students', href: '/faculty/students', icon: Users },
  { title: 'Announcements', href: '/faculty/announcements', icon: Megaphone },
  { title: 'Grievances', href: '/faculty/grievances', icon: AlertCircle },
  { title: 'Leave Requests', href: '/faculty/leave', icon: CalendarOff },
  { title: 'Calendar', href: '/faculty/calendar', icon: CalendarDays },
  { title: 'My Profile', href: '/faculty/profile', icon: User },
];

export function FacultySidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <aside
      className={cn(
        'bg-card border-border/80 hidden flex-col border-r shadow-xs transition-all duration-300 md:flex',
        isCollapsed ? 'w-[70px]' : 'w-64',
      )}
    >
      <div className="border-border/60 flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-faculty-primary/10 text-faculty-primary rounded-lg p-1">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <span className="font-display text-foreground text-base font-bold">Faculty Portal</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-3">
        <nav className="grid gap-1 px-2">
          {facultySidebarNavItems.map((item, index) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-faculty-accent text-faculty-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  isCollapsed ? 'justify-center px-0' : '',
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-faculty-primary' : 'text-muted-foreground',
                  )}
                />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
