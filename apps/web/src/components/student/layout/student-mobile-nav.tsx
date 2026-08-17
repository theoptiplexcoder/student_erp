'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, GraduationCap } from 'lucide-react';
import { cn } from '@student-erp/utils';
import { sidebarNavItems } from './student-sidebar';
import { Button } from '@student-erp/ui';
import { useMobileSidebarStore } from '@/hooks/use-sidebar';

export function StudentMobileNav() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useMobileSidebarStore();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div
        className="fixed inset-0 bg-black/80"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <div className="bg-background animate-in slide-in-from-left fixed inset-y-0 left-0 w-3/4 max-w-sm border-r shadow-lg duration-200">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <Link
              href="/student"
              className="flex items-center gap-2 font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <GraduationCap className="text-primary h-6 w-6 flex-shrink-0" />
              <span className="font-display truncate">Student Portal</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start space-y-1 px-2 text-sm font-medium">
              {sidebarNavItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
