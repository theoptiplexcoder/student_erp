'use client';

import { Bell, Search, HelpCircle } from 'lucide-react';
import { Input, Button, Avatar, AvatarFallback } from '@student-erp/ui';
import { AdminMobileNav } from './admin-mobile-nav';
import { LogoutButton } from '../shared/logout-button';
import { Breadcrumbs } from '../shared/breadcrumbs';
import { ThemeToggle } from '../theme-toggle';
import { useCurrentUser } from '@/hooks/use-current-user';

export function AdminHeader() {
  const { data } = useCurrentUser();
  const user = data?.user;

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'AD';

  return (
    <header className="border-border bg-card/80 sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
      <div className="flex flex-1 items-center">
        <div className="mr-4 md:hidden">
          <AdminMobileNav />
        </div>
        <div className="hidden sm:flex">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search..."
            className="bg-muted/60 focus-visible:ring-admin-primary border-border/60 h-9 w-64 pl-9 text-sm"
          />
        </div>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9">
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="bg-admin-primary ring-background absolute top-2 right-2 h-2 w-2 rounded-full ring-2"></span>
        </Button>

        <Avatar className="border-border h-8 w-8 cursor-pointer border">
          <AvatarFallback className="bg-admin-accent text-admin-accent-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <LogoutButton
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9"
        />
      </div>
    </header>
  );
}
