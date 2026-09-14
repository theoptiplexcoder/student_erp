'use client';
import React from 'react';
import { Search, Bell, HelpCircle, ChevronDown, GraduationCap, Menu } from 'lucide-react';
import { LogoutButton } from '../shared/logout-button';
import { ThemeToggle } from '../theme-toggle';
import { useCurrentUser } from '@/hooks/use-current-user';

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { data } = useCurrentUser();
  const user = data?.user;
  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'TA';

  return (
    <header className="border-border bg-card/80 sticky top-0 z-40 h-[64px] w-full border-b shadow-xs backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </button>

          <div className="hidden items-center gap-2.5 lg:flex">
            <div className="bg-tenant-primary rounded-lg p-1.5 text-white shadow-xs">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-display text-foreground text-base font-bold tracking-tight">
              Student ERP
            </span>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="mx-4 hidden max-w-xl flex-1 md:flex">
          <div className="group relative w-full">
            <Search className="text-muted-foreground group-focus-within:text-tenant-primary absolute top-2.5 left-3 h-4 w-4 transition-colors" />
            <input
              type="search"
              placeholder="Search students, faculty, departments..."
              className="border-input bg-muted/60 placeholder:text-muted-foreground/70 focus-visible:ring-tenant-primary focus:bg-background flex h-9 w-full rounded-lg border px-3 py-1 pr-12 pl-9 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="absolute top-2 right-2.5 flex h-5 items-center gap-1">
              <kbd className="bg-card text-muted-foreground border-border/80 pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium shadow-2xs select-none">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <div className="border-border/80 hover:bg-accent text-foreground hidden cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors md:flex">
            Institution Admin
            <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
          </div>

          <ThemeToggle />

          <button className="hover:bg-accent hover:text-accent-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors">
            <Bell className="text-muted-foreground h-4 w-4" />
            <span className="bg-tenant-primary ring-background absolute top-2 right-2 flex h-2 w-2 rounded-full ring-2" />
            <span className="sr-only">Notifications</span>
          </button>

          <button className="hover:bg-accent hover:text-accent-foreground hidden h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors sm:inline-flex">
            <HelpCircle className="text-muted-foreground h-4 w-4" />
            <span className="sr-only">Help</span>
          </button>

          <div className="bg-tenant-accent border-tenant-primary/20 text-tenant-primary hover:bg-tenant-accent/80 ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border text-xs font-bold transition-colors">
            <span>{initials}</span>
          </div>

          <LogoutButton
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-1 h-9 w-9"
          />
        </div>
      </div>
    </header>
  );
}
