'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@student-erp/utils';
import { useSidebarStore } from '@/hooks/use-sidebar';
import { Button } from '@student-erp/ui';

export const sidebarNavItems = [
  { title: 'Dashboard', href: '/student', icon: LayoutDashboard, exact: true },
  { title: 'My Profile', href: '/student/profile', icon: User },
  { title: 'Timetable', href: '/student/timetable', icon: CalendarDays },
  { title: 'My Courses', href: '/student/courses', icon: BookOpen },
  { title: 'Calendar', href: '/student/calendar', icon: CalendarDays },
  { title: 'Certificates', href: '/student/certificates', icon: GraduationCap },
  { title: 'Feedback', href: '/student/feedback', icon: MessageSquare },
  { title: 'Grievance', href: '/student/grievance', icon: AlertTriangle },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const collapsed = mounted ? isCollapsed : false;

  return (
    <div
      className={cn(
        'bg-muted/40 hidden flex-shrink-0 border-r transition-all duration-300 ease-in-out md:block lg:sticky lg:top-0 lg:h-screen',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="relative flex h-full flex-col gap-2">
        <div
          className={cn(
            'flex h-14 items-center border-b px-4 lg:h-[60px]',
            collapsed ? 'justify-center px-2' : 'lg:px-6',
          )}
        >
          <Link href="/student" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="text-primary h-6 w-6 flex-shrink-0" />
            {!collapsed && <span className="font-display truncate">Student Portal</span>}
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="bg-background absolute top-[21px] -right-3.5 z-50 hidden h-7 w-7 items-center justify-center rounded-full border shadow-sm lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <div className="flex-1 overflow-x-hidden overflow-y-auto py-2">
          <nav className="grid items-start space-y-1 px-2 text-sm font-medium">
            {sidebarNavItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t p-4">
          {!collapsed ? (
            <div className="text-muted-foreground mb-4 truncate text-center text-xs">
              Powered by Student ERP
            </div>
          ) : (
            <div
              className="text-muted-foreground mb-4 truncate text-center text-[10px]"
              title="Student ERP"
            >
              ERP
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
