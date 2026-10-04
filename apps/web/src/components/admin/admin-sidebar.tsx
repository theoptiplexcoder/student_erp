'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@student-erp/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  BookOpen,
  CalendarCheck,
  FileText,
  Award,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  DoorOpen,
  IndianRupee,
  Receipt,
  Layers,
  Users2,
  AlertOctagon,
  GraduationCap,
  ClipboardList,
  Search,
  Sparkles,
  ArrowUpRight,
  Shield,
  HelpCircle,
  UserCheck,
  X,
  CalendarOff,
} from 'lucide-react';
import { Button, Avatar, AvatarFallback, Badge } from '@student-erp/ui';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useAdminSidebarStore } from '@/hooks/use-sidebar';

export interface NavChildItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  exact?: boolean;
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  exact?: boolean;
  children?: NavChildItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const adminNavigationSections: NavSection[] = [
  {
    items: [{ name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true }],
  },
  {
    title: 'ACADEMICS',
    items: [
      {
        name: 'Academics',
        href: '/admin/academics',
        icon: BookOpen,
        exact: true,
      },
      { name: 'Admissions', href: '/admin/admissions', icon: UserPlus },
      { name: 'Students', href: '/admin/students', icon: GraduationCap },
      {
        name: 'Examinations',
        href: '/admin/examinations',
        icon: Award,
      },
      {
        name: 'Timetable',
        href: '/admin/timetable',
        icon: CalendarCheck,
        badge: 'Live',
      },
      { name: 'Attendance', href: '/admin/attendance', icon: ClipboardList },
      { name: 'Promotions', href: '/admin/promotions', icon: UserCheck },
    ],
  },
  {
    title: 'PEOPLE & FINANCE',
    items: [
      { name: 'Faculty', href: '/admin/faculty', icon: Users },
      { name: 'Leave Management', href: '/admin/leave-management', icon: CalendarOff },
      {
        name: 'Finance',
        href: '/admin/finance',
        icon: IndianRupee,
      },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Grievances', href: '/admin/grievances', icon: AlertCircle },
      { name: 'Announcements', href: '/admin/communication/announcements', icon: Megaphone },
      { name: 'Certificates', href: '/admin/certificates', icon: Award },
      { name: 'Analytics & Reports', href: '/admin/reports', icon: FileText },
    ],
  },
  {
    title: 'SYSTEM & SETTINGS',
    items: [
      {
        name: 'Institution Profile',
        href: '/admin/administration/institution',
        icon: Building2,
      },
      {
        name: 'Security & Roles',
        href: '/admin/administration/roles',
        icon: Shield,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useAdminSidebarStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [flyoutPosition, setFlyoutPosition] = useState<{ top: number } | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-expand parents if active route is a child
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      Academics: false,
      Examinations: false,
      Timetable: false,
      Finance: false,
      'Institution Profile': false,
      'Security & Roles': false,
    };
    return initial;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync expanded state when pathname changes
  useEffect(() => {
    adminNavigationSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const isChildActive = item.children.some((c) =>
            c.exact ? pathname === c.href : pathname.startsWith(c.href),
          );
          if (isChildActive) {
            setExpandedSections((prev) => ({ ...prev, [item.name]: true }));
          }
        }
      });
    });
  }, [pathname]);

  const { data: userData } = useCurrentUser();
  const user = userData?.user;
  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'AD';
  const roleName = user?.role ? user.role.replace('_', ' ') : 'Administrator';

  const toggleExpand = (name: string) => {
    setExpandedSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Filter items when searching
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return adminNavigationSections;

    return adminNavigationSections
      .map((section) => {
        const matchingItems = section.items
          .map((item) => {
            const itemMatches = item.name.toLowerCase().includes(q);
            const matchingChildren = item.children?.filter((child) =>
              child.name.toLowerCase().includes(q),
            );

            if (itemMatches || (matchingChildren && matchingChildren.length > 0)) {
              return {
                ...item,
                children:
                  matchingChildren && matchingChildren.length > 0
                    ? matchingChildren
                    : item.children,
              };
            }
            return null;
          })
          .filter(Boolean) as NavItem[];

        return {
          ...section,
          items: matchingItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

  const collapsed = mounted ? isCollapsed : false;

  const handleMouseEnterItem = (itemName: string) => {
    if (!collapsed) return;
    const el = itemRefs.current[itemName];
    if (el) {
      const rect = el.getBoundingClientRect();
      setFlyoutPosition({ top: rect.top });
      setHoveredItem(itemName);
    }
  };

  const handleMouseLeaveSidebar = () => {
    if (collapsed) {
      setHoveredItem(null);
      setFlyoutPosition(null);
    }
  };

  return (
    <aside
      onMouseLeave={handleMouseLeaveSidebar}
      className={cn(
        'group/sidebar relative z-30 hidden h-screen flex-col border-r transition-all duration-300 ease-in-out select-none md:flex',
        'bg-card/95 border-border/80 shadow-xs backdrop-blur-md',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'border-border/70 relative flex h-16 shrink-0 items-center border-b px-3.5 transition-colors',
          collapsed ? 'justify-center px-2' : 'justify-between',
        )}
      >
        <Link
          href="/admin"
          className={cn(
            'group flex items-center gap-3 overflow-hidden transition-all',
            collapsed ? 'justify-center' : 'flex-1',
          )}
        >
          <div className="from-primary/20 via-primary/10 to-primary/5 border-primary/25 text-primary shadow-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-sm transition-transform duration-200 group-hover:scale-105">
            <img src="/logo.svg" alt="Student ERP" className="h-5 w-5 object-contain" />
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-foreground truncate text-sm font-bold tracking-tight">
                  Student ERP
                </span>
                <span className="bg-primary/15 text-primary py-0.2 rounded px-1.5 text-[9px] font-semibold tracking-wide uppercase">
                  Admin
                </span>
              </div>
              <span className="text-muted-foreground truncate text-[11px] leading-none font-medium">
                Enterprise Suite
              </span>
            </div>
          )}
        </Link>

        {/* Toggle Collapse Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'text-muted-foreground hover:text-foreground hover:bg-muted/80 h-7 w-7 shrink-0 rounded-lg transition-all',
            collapsed &&
              'bg-card border-border absolute top-5 -right-3.5 z-40 hidden border shadow-md group-hover/sidebar:flex',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Filter Search Bar (Expanded View) */}
      {!collapsed && (
        <div className="border-border/50 border-b px-3 py-2.5">
          <div className="bg-muted/50 border-border/70 focus-within:border-primary/50 focus-within:ring-primary/20 relative flex items-center rounded-lg border px-2.5 py-1.5 transition-all focus-within:ring-2">
            <Search className="text-muted-foreground/70 mr-2 h-3.5 w-3.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Jump to module..."
              className="placeholder:text-muted-foreground/60 text-foreground w-full bg-transparent text-xs outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Scroll Area */}
      <div className="scrollbar-thumb-border flex-1 scrollbar-thin scrollbar-track-transparent space-y-4 overflow-y-auto px-2.5 py-3">
        {filteredSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && section.title && (
              <div className="text-muted-foreground/60 flex items-center justify-between px-2 pt-2.5 pb-1 text-[10px] font-bold tracking-wider uppercase">
                <span>{section.title}</span>
                <span className="bg-border/60 ml-2 h-[1px] flex-1" />
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));

                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = searchQuery ? true : (expandedSections[item.name] ?? isActive);

                const isHovered = hoveredItem === item.name;

                return (
                  <div
                    key={item.name}
                    ref={(el) => {
                      itemRefs.current[item.name] = el;
                    }}
                    onMouseEnter={() => handleMouseEnterItem(item.name)}
                    className="relative flex flex-col"
                  >
                    <div className="group/item flex items-center">
                      <Link
                        href={item.href}
                        className={cn(
                          'relative flex flex-1 items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150',
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                          collapsed ? 'justify-center px-0 py-2.5' : '',
                        )}
                        title={collapsed ? item.name : undefined}
                      >
                        {/* Active Accent Indicator */}
                        {isActive && (
                          <span
                            className={cn(
                              'bg-primary absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full transition-all',
                              collapsed ? 'left-0.5' : 'left-0',
                            )}
                          />
                        )}

                        <item.icon
                          className={cn(
                            'shrink-0 transition-transform duration-200 group-hover/item:scale-110',
                            collapsed ? 'h-5 w-5' : 'h-4 w-4',
                            isActive
                              ? 'text-primary'
                              : 'text-muted-foreground/80 group-hover/item:text-foreground',
                          )}
                        />

                        {!collapsed && (
                          <div className="flex flex-1 items-center justify-between overflow-hidden">
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="bg-primary/15 text-primary border-primary/20 ml-2 rounded-full border px-1.5 py-0.5 text-[9px] leading-none font-semibold">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </Link>

                      {/* Dropdown chevron trigger */}
                      {!collapsed && hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleExpand(item.name);
                          }}
                          aria-label={`Toggle ${item.name} menu`}
                          className="text-muted-foreground/70 hover:text-foreground hover:bg-muted/80 rounded-md p-1.5 transition-colors"
                        >
                          <ChevronDown
                            className={cn(
                              'h-3.5 w-3.5 transition-transform duration-200',
                              isExpanded ? 'text-foreground rotate-180' : '',
                            )}
                          />
                        </button>
                      )}
                    </div>

                    {/* Submenu Accordion for Expanded View */}
                    {!collapsed && hasChildren && isExpanded && (
                      <div className="border-border/70 relative mt-1 ml-4 space-y-0.5 border-l py-0.5 pl-2.5">
                        {item.children?.map((child) => {
                          const isChildActive = child.exact
                            ? pathname === child.href
                            : pathname === child.href || pathname.startsWith(child.href);

                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                'group/child relative flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors',
                                isChildActive
                                  ? 'bg-primary/10 text-primary font-semibold'
                                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                              )}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className={cn(
                                    'h-1.5 w-1.5 rounded-full transition-colors',
                                    isChildActive
                                      ? 'bg-primary scale-125'
                                      : 'bg-muted-foreground/40 group-hover/child:bg-muted-foreground',
                                  )}
                                />
                                <span className="truncate">{child.name}</span>
                              </div>
                              {child.badge && (
                                <span className="bg-muted text-muted-foreground rounded px-1 text-[9px]">
                                  {child.badge}
                                </span>
                              )}
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

      {/* Floating Hover Popover when Collapsed */}
      {collapsed && hoveredItem && flyoutPosition && (
        <div
          onMouseEnter={() => setHoveredItem(hoveredItem)}
          onMouseLeave={() => setHoveredItem(null)}
          style={{ top: Math.max(12, Math.min(flyoutPosition.top, window.innerHeight - 320)) }}
          className="bg-popover border-border text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed left-[76px] z-50 max-w-[240px] min-w-[200px] rounded-xl border p-2 shadow-xl duration-150"
        >
          {(() => {
            const foundItem = adminNavigationSections
              .flatMap((s) => s.items)
              .find((i) => i.name === hoveredItem);

            if (!foundItem) return null;

            return (
              <div className="space-y-1.5">
                <div className="border-border/60 flex items-center justify-between border-b px-2 py-1 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <foundItem.icon className="text-primary h-4 w-4" />
                    <span>{foundItem.name}</span>
                  </div>
                  {foundItem.badge && (
                    <Badge variant="outline" className="text-[9px]">
                      {foundItem.badge}
                    </Badge>
                  )}
                </div>

                {foundItem.children && foundItem.children.length > 0 ? (
                  <div className="space-y-0.5 pt-1">
                    {foundItem.children.map((child) => {
                      const isChildActive = child.exact
                        ? pathname === child.href
                        : pathname === child.href || pathname.startsWith(child.href);

                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setHoveredItem(null)}
                          className={cn(
                            'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                            isChildActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          )}
                        >
                          <child.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <Link
                    href={foundItem.href}
                    onClick={() => setHoveredItem(null)}
                    className="text-primary hover:bg-primary/5 flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium"
                  >
                    <span>Open {foundItem.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                  </Link>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* User / Institution Footer Profile Strip */}
      <div className="border-border/70 bg-card/60 border-t p-2.5">
        <div
          className={cn(
            'hover:bg-muted/70 group flex items-center gap-3 rounded-xl p-1.5 transition-all duration-200',
            collapsed ? 'justify-center p-1' : '',
          )}
        >
          <div className="relative shrink-0">
            <Avatar className="border-primary/20 ring-primary/10 h-8 w-8 border ring-2">
              <AvatarFallback className="from-primary/20 to-primary/5 text-primary bg-gradient-to-br text-[11px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="ring-card absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2" />
          </div>

          {!collapsed && (
            <div className="flex flex-1 flex-col truncate leading-tight">
              <div className="flex items-center justify-between">
                <span className="text-foreground truncate text-xs font-semibold">
                  {user
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User'
                    : 'Administrator'}
                </span>
              </div>
              <span className="text-muted-foreground/80 mt-0.5 truncate text-[10px] font-medium capitalize">
                {roleName}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
