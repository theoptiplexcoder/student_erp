'use client';

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
  Settings,
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
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { Button, Avatar, AvatarFallback } from '@student-erp/ui';
import { useCurrentUser } from '@/hooks/use-current-user';

interface NavSection {
  title?: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: {
      name: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

const navigationSections: NavSection[] = [
  {
    items: [{ name: 'Dashboard', href: '/admin', icon: LayoutDashboard }],
  },
  {
    title: 'ACADEMICS',
    items: [
      { name: 'Students', href: '/admin/students', icon: GraduationCap },
      { name: 'Admissions', href: '/admin/admissions', icon: UserPlus },
      { name: 'Academics', href: '/admin/academics', icon: BookOpen },
      {
        name: 'Examinations',
        href: '/admin/examinations',
        icon: Award,
        children: [
          { name: 'Schedules', href: '/admin/examinations/exams', icon: CalendarCheck },
          { name: 'Grading & Types', href: '/admin/examinations/grading', icon: Award },
          { name: 'Results', href: '/admin/examinations/results', icon: FileText },
        ],
      },
      {
        name: 'Timetable',
        href: '/admin/timetable',
        icon: CalendarCheck,
        children: [
          { name: 'Weekly Schedule', href: '/admin/timetable/weekly', icon: CalendarCheck },
          { name: 'Faculty Timetable', href: '/admin/timetable/faculty', icon: Users },
          { name: 'Rooms', href: '/admin/administration/rooms', icon: DoorOpen },
        ],
      },
      { name: 'Attendance', href: '/admin/attendance', icon: ClipboardList },
    ],
  },
  {
    title: 'PEOPLE & FINANCE',
    items: [
      { name: 'Faculty', href: '/admin/faculty', icon: Users },
      {
        name: 'Finance',
        href: '/admin/finance',
        icon: IndianRupee,
        children: [
          { name: 'Overview', href: '/admin/finance', icon: LayoutDashboard },
          { name: 'Fee Structures', href: '/admin/finance/structures', icon: Layers },
          { name: 'Student Fee Plans', href: '/admin/finance/plans', icon: Users2 },
          { name: 'Payments & Receipts', href: '/admin/finance/payments', icon: Receipt },
          { name: 'Defaulters', href: '/admin/finance/defaulters', icon: AlertOctagon },
        ],
      },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'Grievances', href: '/admin/grievances', icon: AlertCircle },
      { name: 'Announcements', href: '/admin/communication/announcements', icon: Megaphone },
      { name: 'Certificates', href: '/admin/certificates', icon: Award },
      { name: 'Reports', href: '/admin/reports', icon: FileText },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Institution', href: '/admin/administration/institution', icon: Building2 },
      { name: 'Settings', href: '/admin/administration/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Examinations: false,
    Timetable: false,
    Finance: false,
  });

  const { data: userData } = useCurrentUser();
  const user = userData?.user;
  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'AD';

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside
      className={cn(
        'bg-card border-border/80 relative z-20 hidden h-screen flex-col border-r shadow-xs transition-all duration-300 select-none md:flex',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Brand Header */}
      <div className="border-border/70 flex h-14 items-center justify-between border-b px-3.5">
        {!isCollapsed ? (
          <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="font-display text-foreground truncate text-sm font-semibold tracking-tight">
                Student ERP
              </span>
              <span className="text-muted-foreground truncate text-[11px] leading-none">
                Admin Console
              </span>
            </div>
          </Link>
        ) : (
          <div className="mx-auto">
            <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/80 h-7 w-7 shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 space-y-4 overflow-y-auto px-2.5 py-3">
        {navigationSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && section.title && (
              <div className="text-muted-foreground/70 px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase">
                {section.title}
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin' && pathname.startsWith(item.href));
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems[item.name] ?? isActive;

                return (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                          isCollapsed ? 'justify-center px-0 py-2' : '',
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive
                              ? 'text-primary'
                              : 'text-muted-foreground group-hover:text-foreground',
                          )}
                        />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>

                      {!isCollapsed && hasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.name)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md p-1"
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

                    {!isCollapsed && hasChildren && isExpanded && (
                      <div className="border-border/60 mt-0.5 ml-4 space-y-0.5 border-l pl-2">
                        {item.children?.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                'group flex items-center gap-2 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                                isChildActive
                                  ? 'text-primary bg-primary/5 font-semibold'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40',
                              )}
                            >
                              <child.icon
                                className={cn(
                                  'h-3 w-3 shrink-0',
                                  isChildActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground/70 group-hover:text-foreground',
                                )}
                              />
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

      {/* User / Footer Profile Strip */}
      <div className="border-border/70 border-t p-2.5">
        <div
          className={cn(
            'hover:bg-muted/50 flex items-center gap-2.5 rounded-md p-1.5 transition-colors',
            isCollapsed ? 'justify-center p-1' : '',
          )}
        >
          <Avatar className="border-border/80 h-7 w-7 shrink-0 border">
            <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col truncate leading-none">
              <span className="text-foreground truncate text-xs font-medium">
                {user
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin User'
                  : 'Administrator'}
              </span>
              <span className="text-muted-foreground mt-0.5 truncate text-[10px]">
                {user?.email || 'admin@institution.edu'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
