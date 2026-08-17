'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Menu, User, Settings, LogOut } from 'lucide-react';
import { useStudentProfile } from '@student-erp/hooks';
import { Button } from '@student-erp/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@student-erp/ui';

export function StudentNavbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { data: student } = useStudentProfile();

  const firstName = student?.user?.firstName || 'Student';
  const lastName = student?.user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <header className="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1 md:hidden">
        <span className="font-display text-lg font-bold">Student Portal</span>
      </div>
      <div className="hidden w-full flex-1 md:block">
        {/* Optional Page Title or Breadcrumb can go here */}
      </div>

      <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/student/notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-600"></span>
            <span className="sr-only">Toggle notifications</span>
          </Link>
        </Button>

        {/* Replace with DropdownMenu when available in ui package or use a standard approach */}
        <div className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md p-1 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{firstName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col text-sm md:flex">
            <span className="leading-none font-medium">{fullName}</span>
            <span className="text-muted-foreground mt-1 text-xs">
              {student?.studentCode || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
