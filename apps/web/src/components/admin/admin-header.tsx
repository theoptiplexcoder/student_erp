'use client';

import { Bell, Search, HelpCircle } from 'lucide-react';
import { Input, Button, Avatar, AvatarFallback } from '@student-erp/ui';
import { AdminMobileNav } from './admin-mobile-nav';
import { LogoutButton } from '../shared/logout-button';
import { Breadcrumbs } from '../shared/breadcrumbs';
import { useCurrentUser } from '@/hooks/use-current-user';

export function AdminHeader() {
  const { data } = useCurrentUser();
  const user = data?.user;

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'AD';

  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex flex-1 items-center">
        <div className="mr-4 md:hidden">
          <AdminMobileNav />
        </div>
        <div className="hidden sm:flex">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search..."
            className="bg-muted/50 focus-visible:ring-admin-primary w-64 border-none pl-9"
          />
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="bg-admin-primary absolute top-1.5 right-1.5 h-2 w-2 rounded-full"></span>
        </Button>

        <Avatar className="border-border h-8 w-8 cursor-pointer border">
          <AvatarFallback className="bg-admin-accent text-admin-accent-foreground text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <LogoutButton
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        />
      </div>
    </header>
  );
}
