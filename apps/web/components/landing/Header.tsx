'use client';

import React, { useState } from 'react';
import { Button } from '@student-erp/ui';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background/90 border-border/70 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 select-none">
          <Image
            src="/logo.svg"
            alt="Student ERP Logo"
            width={30}
            height={30}
            className="object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="font-display text-foreground text-lg font-bold tracking-tight sm:text-xl">
              Student ERP
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="text-muted-foreground hidden items-center gap-7 text-sm font-medium md:flex">
          <a href="#features" className="hover:text-foreground transition-colors">
            Capabilities
          </a>
          <a href="#preview" className="hover:text-foreground transition-colors">
            Platform Demo
          </a>
          <a href="#personas" className="hover:text-foreground transition-colors">
            Workspaces
          </a>
          <a href="#security" className="hover:text-foreground transition-colors">
            Security & Trust
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        {/* Action Controls */}
        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="ghost" size="sm" className="h-9 text-xs font-medium">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-medium shadow-xs">
            <Link href="/signup">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-muted-foreground h-9 w-9"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="bg-background/95 border-border/80 border-b px-4 pt-3 pb-6 md:hidden">
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground py-1.5"
            >
              Capabilities
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground py-1.5"
            >
              Platform Demo
            </a>
            <a
              href="#personas"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground py-1.5"
            >
              Workspaces
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground py-1.5"
            >
              Security & Trust
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground py-1.5"
            >
              FAQ
            </a>
            <div className="border-border/60 flex flex-col gap-2 border-t pt-3">
              <Button asChild variant="outline" size="sm" className="w-full justify-center">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="w-full justify-center">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
