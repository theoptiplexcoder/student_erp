// @ts-nocheck
import React from "react";
import { BrandPanel } from "./BrandPanel";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Left Panel (Brand) - Hidden on mobile */}
      <div className="hidden lg:flex w-2/5 relative border-r border-border">
        <BrandPanel />
      </div>
      
      {/* Right Panel (Auth Forms) */}
      <div className="flex w-full lg:w-3/5 items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-[480px]">
          {children}
        </div>
      </div>
    </div>
  );
}
