'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useStudentProfile } from '@student-erp/hooks';
import { Button } from '@student-erp/ui';
import { Avatar, AvatarFallback } from '@student-erp/ui';
import { LogoutButton } from '../../shared/logout-button';
import { Breadcrumbs } from '../../shared/breadcrumbs';
import { useMobileSidebarStore } from '@/hooks/use-sidebar';
import { NotificationBell } from './notification-bell';

export function StudentNavbar() {
  const { data: student } = useStudentProfile();
  const setIsOpen = useMobileSidebarStore((state) => state.setIsOpen);

  const firstName = student?.user?.firstName || 'Student';
  const lastName = student?.user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <header className="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
      <div className="flex w-full flex-1 items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="-ml-2 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <span className="font-display text-lg font-bold">Student Portal</span>
      </div>
      <div className="hidden w-full flex-1 md:block">
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
        <NotificationBell />

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

        <LogoutButton
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        />
      </div>
    </header>
  );
}
