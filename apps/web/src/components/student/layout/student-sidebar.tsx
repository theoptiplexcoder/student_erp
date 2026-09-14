'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Award,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  User,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
} from 'lucide-react';
import { cn } from '@student-erp/utils';
import { useSidebarStore } from '@/hooks/use-sidebar';
import { Button } from '@student-erp/ui';

export const sidebarNavItems = [
  { title: 'Dashboard', href: '/student', icon: LayoutDashboard, exact: true },
  { title: 'My Profile', href: '/student/profile', icon: User },
  { title: 'Fees & Dues', href: '/student/finance', icon: IndianRupee },
  { title: 'Timetable', href: '/student/timetable', icon: CalendarDays },
  { title: 'My Courses', href: '/student/courses', icon: BookOpen },
  { title: 'Examinations', href: '/student/examinations', icon: Award },
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
        'bg-card border-border/80 hidden flex-shrink-0 border-r shadow-xs transition-all duration-300 ease-in-out md:block lg:sticky lg:top-0 lg:h-screen',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="relative flex h-full flex-col gap-2">
        <div
          className={cn(
            'border-border/60 flex h-14 items-center border-b px-4 lg:h-[60px]',
            collapsed ? 'justify-center px-2' : 'lg:px-6',
          )}
        >
          <Link href="/student" className="flex items-center gap-2.5 font-semibold">
            <div className="bg-student-primary/10 text-student-primary rounded-lg p-1.5">
              <GraduationCap className="h-5 w-5 flex-shrink-0" />
            </div>
            {!collapsed && (
              <span className="font-display text-foreground truncate font-bold">
                Student Portal
              </span>
            )}
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="bg-card border-border hover:bg-accent text-muted-foreground absolute top-[18px] -right-3 z-50 hidden h-6 w-6 items-center justify-center rounded-full border shadow-xs lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-student-accent text-student-primary font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isActive ? 'text-student-primary' : 'text-muted-foreground',
                    )}
                  />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-border/60 mt-auto border-t p-4">
          {!collapsed ? (
            <div className="text-muted-foreground truncate text-center text-xs">
              Student ERP • Student Portal
            </div>
          ) : (
            <div
              className="text-muted-foreground truncate text-center text-[10px]"
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
