'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@student-erp/ui';
import { UserNav } from '../../admin/user-nav';
import { ThemeToggle } from '../../theme-toggle';

export function FacultyNavbar() {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-14 items-center px-4 md:px-6">
        <div className="flex flex-1 items-center gap-4">
          <span className="font-display font-bold md:hidden">ERP</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
