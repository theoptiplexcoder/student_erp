'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@student-erp/ui';
import { cn } from '@student-erp/utils';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface HeaderProps {
  course: any;
  section: any;
  studentsCount: number;
}

export function SectionDetailHeader({ course, section, studentsCount }: HeaderProps) {
  const pathname = usePathname();
  const baseUrl = `/faculty/sections/${section?.id}/${course?.id}`;

  const tabs = [
    { label: 'Attendance', href: `${baseUrl}/attendance` },
    { label: 'Gradebook', href: `${baseUrl}/gradebook` },
    { label: 'Students', href: `${baseUrl}/students` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/faculty/sections">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex flex-1 items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {course?.name} — Section {section?.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              {course?.code} • {section?.program?.name} • {studentsCount} students
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/faculty/courses/${course?.id}`}>
              Course Workspace <BookOpen className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex border-b">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'border-b-2 px-6 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-transparent',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
