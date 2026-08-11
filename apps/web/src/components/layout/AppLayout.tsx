"use client";
import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";

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
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1">
        <Sidebar collapsed={collapsed} />
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out`}>
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-[280px] bg-background border-r border-border shadow-2xl pt-16"
            onClick={e => e.stopPropagation()}
          >
            {/* We can re-use the sidebar content here, but setting collapsed to false */}
            <div className="h-full overflow-y-auto w-[280px]">
               <Sidebar collapsed={false} />
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop Toggle Button (Float bottom left) */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex fixed bottom-4 left-4 z-50 items-center justify-center h-8 w-8 rounded-full bg-background border border-border shadow-sm hover:bg-accent text-muted-foreground"
      >
        <Menu className="h-4 w-4" />
      </button>
    </div>
  );
}
