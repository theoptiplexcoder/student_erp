"use client";
import React from "react";
import { Search, Bell, HelpCircle, ChevronDown, GraduationCap, Menu } from "lucide-react";

export function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full h-[64px] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Sidebar</span>
          </button>
          
          <div className="hidden lg:flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Student ERP</span>
          </div>
        </div>

        {/* Center: Global Search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full group">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="search"
              placeholder="Search students, faculty, departments..."
              className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9 focus:bg-background"
            />
            <div className="absolute right-2.5 top-2 h-5 flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Role Switcher */}
          <div className="hidden md:flex items-center gap-1 px-3 py-1.5 border border-border rounded-md text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
            Institution Admin
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>

          <button className="inline-flex relative items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-destructive" />
            <span className="sr-only">Notifications</span>
          </button>
          
          <button className="hidden sm:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Help</span>
          </button>

          <div className="ml-2 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 border border-primary/20 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
            <span className="font-semibold text-sm">TA</span>
          </div>
        </div>

      </div>
    </header>
  );
}
