'use client';
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    // On mobile, this opens the drawer. On desktop, this toggles collapse.
    if (window.innerWidth < 1024) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div className="bg-muted/20 flex min-h-screen flex-col">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar collapsed={collapsed} />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out`}>
          <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="bg-background border-border fixed inset-y-0 left-0 w-[280px] border-r pt-16 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* We can re-use the sidebar content here, but setting collapsed to false */}
            <div className="h-full w-[280px] overflow-y-auto">
              <Sidebar collapsed={false} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Toggle Button (Float bottom left) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="bg-background border-border hover:bg-accent text-muted-foreground fixed bottom-4 left-4 z-50 hidden h-8 w-8 items-center justify-center rounded-full border shadow-sm lg:flex"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}
