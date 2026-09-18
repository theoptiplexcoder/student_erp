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
    <header className="border-border/70 bg-card/90 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
      <div className="flex flex-1 items-center">
        <div className="mr-3 md:hidden">
          <AdminMobileNav />
        </div>
        <div className="hidden sm:flex">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="relative hidden md:block">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" />
          <Input
            type="search"
            placeholder="Search anything (students, courses, faculty)..."
            className="bg-muted/50 border-border/70 focus-visible:ring-primary placeholder:text-muted-foreground/70 h-8 w-64 pl-8 text-xs lg:w-80"
          />
        </div>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/70 h-8 w-8"
          title="Help & documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/70 relative h-8 w-8"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="bg-primary ring-background absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2"></span>
        </Button>

        <div className="border-border/70 bg-border mx-1 hidden h-4 w-[1px] sm:block" />

        <Avatar className="border-border/80 h-7 w-7 cursor-pointer border">
          <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <LogoutButton
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8"
        />
      </div>
    </header>
  );
}
