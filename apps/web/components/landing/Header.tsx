// @ts-nocheck
import React from "react";
import { Button } from "@student-erp/ui";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/landing1.svg" alt="Student ERP Logo" width={32} height={32} />
          <span className="font-display font-bold text-xl tracking-tight">Student ERP</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#solutions" className="hover:text-foreground transition-colors">Solutions</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
