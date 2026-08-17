'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();

  if (!pathname || pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center text-sm">
      <ol className="flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link href="/" className="hover:text-foreground flex items-center transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

          return (
            <li key={href} className="flex items-center">
              <ChevronRight className="mx-1 h-4 w-4" />
              {isLast ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {title}
                </span>
              ) : (
                <Link href={href} className="hover:text-foreground transition-colors">
                  {title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
