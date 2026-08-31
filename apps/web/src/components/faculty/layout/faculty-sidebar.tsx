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
  { title: 'Examinations', href: '/faculty/examinations', icon: FileText },
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
        'bg-background hidden flex-col border-r transition-all duration-300 md:flex',
        isCollapsed ? 'w-[70px]' : 'w-64',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && <span className="font-display text-lg font-bold">Faculty Portal</span>}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {facultySidebarNavItems.map((item, index) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted',
                  isCollapsed ? 'justify-center px-0' : '',
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
