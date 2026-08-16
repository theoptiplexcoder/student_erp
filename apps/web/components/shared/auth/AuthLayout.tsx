import React from 'react';
import { BrandPanel } from './BrandPanel';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative flex min-h-screen overflow-hidden">
      {/* Left Panel (Brand) - Hidden on mobile */}
      <div className="border-border relative hidden w-2/5 border-r lg:flex">
        <BrandPanel />
      </div>

      {/* Right Panel (Auth Forms) */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 md:p-12 lg:w-3/5">
        <div className="w-full max-w-[480px]">{children}</div>
      </div>
    </div>
  );
}
