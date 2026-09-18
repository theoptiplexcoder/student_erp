import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-card border-border/70 border-t py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 space-y-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.svg"
                alt="Student ERP Logo"
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="font-display text-foreground text-lg font-bold tracking-tight">
                Student ERP
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
              The high-density, multi-tenant Academic ERP platform for schools, colleges, and
              universities. Built for institutional reliability and academic excellence.
            </p>
          </div>

          <div>
            <h4 className="text-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Platform Modules
            </h4>
            <ul className="text-muted-foreground space-y-2 text-xs">
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Admissions & Enrollment
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Attendance Monitoring
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Timetable Generator
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Examinations & Grading
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-foreground transition-colors">
                  Fee Management
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Workspaces
            </h4>
            <ul className="text-muted-foreground space-y-2 text-xs">
              <li>
                <Link href="#personas" className="hover:text-foreground transition-colors">
                  Institution Leadership
                </Link>
              </li>
              <li>
                <Link href="#personas" className="hover:text-foreground transition-colors">
                  Faculty Workspace
                </Link>
              </li>
              <li>
                <Link href="#personas" className="hover:text-foreground transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="#personas" className="hover:text-foreground transition-colors">
                  Parent / Guardian Access
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
              Trust & Legal
            </h4>
            <ul className="text-muted-foreground space-y-2 text-xs">
              <li>
                <Link href="#security" className="hover:text-foreground transition-colors">
                  Security Overview
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  FERPA Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border/60 text-muted-foreground flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Student ERP. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Register Campus
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
