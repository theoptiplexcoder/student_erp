'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  Shield,
  Sparkles,
  Building2,
} from 'lucide-react';
import { Button, Avatar, AvatarFallback, Badge } from '@student-erp/ui';
import { cn } from '@student-erp/utils';
import { adminNavigationSections } from './admin-sidebar';
import { useCurrentUser } from '@/hooks/use-current-user';

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { data: userData } = useCurrentUser();
  const user = userData?.user;

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'AD';

  const toggleExpand = (name: string) => {
    setExpandedSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredSections = adminNavigationSections
    .map((section) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return section;

      const items = section.items
        .map((item) => {
          const matches = item.name.toLowerCase().includes(q);
          const matchingChildren = item.children?.filter((c) => c.name.toLowerCase().includes(q));
          if (matches || (matchingChildren && matchingChildren.length > 0)) {
            return {
              ...item,
              children:
                matchingChildren && matchingChildren.length > 0 ? matchingChildren : item.children,
            };
          }
          return null;
        })
        .filter(Boolean);

      return {
        ...section,
        items,
      };
    })
    .filter((sec) => sec.items.length > 0);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="text-muted-foreground hover:text-foreground h-9 w-9"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Drawer Overlay */}
      {open && (
        <div
          className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={cn(
          'bg-card fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="border-border/70 flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="from-primary/20 via-primary/10 to-primary/5 border-primary/20 flex h-8 w-8 items-center justify-center rounded-lg border bg-gradient-to-br shadow-xs">
              <img src="/logo.svg" alt="Student ERP" className="h-4.5 w-4.5 object-contain" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-display text-foreground text-sm font-bold tracking-tight">
                Student ERP
              </span>
              <span className="text-muted-foreground text-[10px] leading-none font-medium">
                Admin Console
              </span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="border-border/50 border-b p-3">
          <div className="bg-muted/50 border-border/70 relative flex items-center rounded-lg border px-2.5 py-1.5">
            <Search className="text-muted-foreground/70 mr-2 h-3.5 w-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections..."
              className="placeholder:text-muted-foreground/60 text-foreground w-full bg-transparent text-xs outline-none"
            />
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
          {filteredSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && (
                <div className="text-muted-foreground/60 flex items-center justify-between px-2 pt-2 pb-1 text-[10px] font-bold tracking-wider uppercase">
                  <span>{section.title}</span>
                  <span className="bg-border/60 ml-2 h-[1px] flex-1" />
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map((item: any) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href ||
                      (item.href !== '/admin' && pathname.startsWith(item.href));
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = searchQuery ? true : (expandedSections[item.name] ?? isActive);

                  return (
                    <div key={item.name} className="flex flex-col">
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'group flex flex-1 items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                          )}
                        >
                          <item.icon
                            className={cn(
                              'h-4 w-4 shrink-0',
                              isActive ? 'text-primary' : 'text-muted-foreground',
                            )}
                          />
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.badge && (
                            <span className="bg-primary/15 text-primary border-primary/20 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </Link>

                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.name)}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md p-1.5"
                          >
                            <ChevronDown
                              className={cn(
                                'h-3.5 w-3.5 transition-transform duration-200',
                                isExpanded ? 'rotate-180' : '',
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="border-border/60 mt-0.5 ml-4 space-y-0.5 border-l py-0.5 pl-3">
                          {item.children.map((child: any) => {
                            const isChildActive = child.exact
                              ? pathname === child.href
                              : pathname === child.href || pathname.startsWith(child.href);

                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                                  isChildActive
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                                )}
                              >
                                <child.icon className="h-3.5 w-3.5 opacity-70" />
                                <span className="truncate">{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="border-border/70 border-t p-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="border-border/80 h-8 w-8 border">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col truncate leading-tight">
              <span className="text-foreground truncate text-xs font-semibold">
                {user
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User'
                  : 'Administrator'}
              </span>
              <span className="text-muted-foreground truncate text-[10px]">
                {user?.email || 'admin@institution.edu'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
