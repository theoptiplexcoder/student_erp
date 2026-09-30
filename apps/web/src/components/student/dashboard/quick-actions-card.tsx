'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  BookOpen,
  Clock,
  FileText,
  IndianRupee,
  Award,
  MessageSquare,
  AlertTriangle,
  Users,
  User,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { cn } from '@student-erp/utils';

const quickActions = [
  {
    label: 'Timetable',
    href: '/student/timetable',
    icon: CalendarDays,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-950/60',
  },
  {
    label: 'My Courses',
    href: '/student/courses',
    icon: BookOpen,
    color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    hoverColor: 'hover:bg-violet-100 dark:hover:bg-violet-950/60',
  },
  {
    label: 'Attendance',
    href: '/student/courses?tab=attendance',
    icon: Clock,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60',
  },
  {
    label: 'Fees & Dues',
    href: '/student/finance',
    icon: IndianRupee,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-950/60',
  },
  {
    label: 'Examinations',
    href: '/student/examinations',
    icon: Award,
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    hoverColor: 'hover:bg-rose-100 dark:hover:bg-rose-950/60',
  },
  {
    label: 'Certificates',
    href: '/student/certificates',
    icon: FileText,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
    hoverColor: 'hover:bg-sky-100 dark:hover:bg-sky-950/60',
  },
  {
    label: 'Feedback',
    href: '/student/feedback',
    icon: MessageSquare,
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
    hoverColor: 'hover:bg-teal-100 dark:hover:bg-teal-950/60',
  },
  {
    label: 'Grievance',
    href: '/student/grievance',
    icon: AlertTriangle,
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-950/60',
  },
  {
    label: 'Clubs',
    href: '/student/clubs',
    icon: Users,
    color: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
    hoverColor: 'hover:bg-pink-100 dark:hover:bg-pink-950/60',
  },
  {
    label: 'My Profile',
    href: '/student/profile',
    icon: User,
    color: 'bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
    hoverColor: 'hover:bg-slate-100 dark:hover:bg-slate-800/80',
  },
];

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-colors',
                action.color,
                action.hoverColor,
              )}
            >
              <action.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-xs leading-tight font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
