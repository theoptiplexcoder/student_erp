'use client';

import { Bell, Search, HelpCircle, Menu } from 'lucide-react';
import { Input, Button, Avatar, AvatarFallback } from '@student-erp/ui';
import { usePathname } from 'next/navigation';

export function AdminHeader() {
  const pathname = usePathname();

  // Simple breadcrumb generator based on pathname
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="border-border bg-background sticky top-0 z-10 flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex flex-1 items-center">
        <div className="mr-4 md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-muted-foreground hidden items-center space-x-2 text-sm sm:flex">
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const text = segment.charAt(0).toUpperCase() + segment.slice(1);

            return (
              <div key={segment} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <span className={isLast ? 'text-foreground font-medium' : ''}>{text}</span>
              </div>
            );
          })}
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
            AD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
