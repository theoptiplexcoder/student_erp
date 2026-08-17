'use client';
import React from 'react';
import { Search, Bell, HelpCircle, ChevronDown, GraduationCap, Menu } from 'lucide-react';
import { LogoutButton } from '../shared/logout-button';
import { useCurrentUser } from '@/hooks/use-current-user';

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { data } = useCurrentUser();
  const user = data?.user;
  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'TA';

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 h-[64px] w-full border-b backdrop-blur">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="bg-primary text-primary-foreground rounded-md p-1.5">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Student ERP</span>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="mx-4 hidden max-w-xl flex-1 md:flex">
          <div className="group relative w-full">
            <Search className="text-muted-foreground group-focus-within:text-primary absolute top-2.5 left-2.5 h-4 w-4 transition-colors" />
            <input
              type="search"
              placeholder="Search students, faculty, departments..."
              className="border-input bg-muted/50 placeholder:text-muted-foreground focus-visible:ring-ring focus:bg-background flex h-9 w-full rounded-md border px-3 py-1 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="absolute top-2 right-2.5 flex h-5 items-center gap-1">
              <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <div className="border-border hover:bg-accent hidden cursor-pointer items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors md:flex">
            Institution Admin
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          </div>

          <button className="hover:bg-accent hover:text-accent-foreground relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors">
            <Bell className="text-muted-foreground h-5 w-5" />
            <span className="bg-destructive absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full" />
            <span className="sr-only">Notifications</span>
          </button>

          <button className="hover:bg-accent hover:text-accent-foreground hidden h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors sm:inline-flex">
            <HelpCircle className="text-muted-foreground h-5 w-5" />
            <span className="sr-only">Help</span>
          </button>

          <div className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 ml-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors">
            <span className="text-sm font-semibold">{initials}</span>
          </div>

          <LogoutButton
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-1"
          />
        </div>
      </div>
    </header>
  );
}
