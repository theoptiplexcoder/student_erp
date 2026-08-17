'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, BookOpen, User } from 'lucide-react';
import { cn } from '@student-erp/utils';

export function StudentMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { title: 'Home', href: '/student', icon: Home, exact: true },
    { title: 'Timetable', href: '/student/timetable', icon: CalendarDays },
    { title: 'Courses', href: '/student/courses', icon: BookOpen },
    { title: 'Profile', href: '/student/profile', icon: User },
  ];

  return (
    <div className="bg-background pb-safe fixed right-0 bottom-0 left-0 z-50 flex items-center justify-around border-t px-2 py-2 shadow-lg md:hidden">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-1 text-xs transition-colors',
              isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : '')} />
            <span className="truncate">{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
