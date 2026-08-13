import React from 'react';
import { Button } from '@student-erp/ui';
import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-background/80 border-border fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image src="/landing1.svg" alt="Student ERP Logo" width={32} height={32} />
          <span className="font-display text-xl font-bold tracking-tight">Student ERP</span>
        </div>

        <nav className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#solutions" className="hover:text-foreground transition-colors">
            Solutions
          </a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">
            Testimonials
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
