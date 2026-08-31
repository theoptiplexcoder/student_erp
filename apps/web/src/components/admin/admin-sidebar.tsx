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
  AlertCircle,
  DoorOpen,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@student-erp/ui';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Admissions', href: '/admin/admissions', icon: UserPlus },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Academics', href: '/admin/academics', icon: BookOpen },
  { name: 'Faculty', href: '/admin/faculty', icon: Users },
  { name: 'Examinations', href: '/admin/examinations', icon: FileText },
  {
    name: 'Timetable',
    href: '/admin/timetable',
    icon: CalendarCheck,
    children: [{ name: 'Rooms', href: '/admin/administration/rooms', icon: DoorOpen }],
  },
  { name: 'Grievances', href: '/admin/grievances', icon: AlertCircle },
  { name: 'Announcements', href: '/admin/communication/announcements', icon: Megaphone },
  { name: 'Institution', href: '/admin/administration/institution', icon: Building2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'bg-admin-sidebar border-admin-sidebar-border relative z-20 hidden h-screen flex-col border-r transition-all duration-300 md:flex',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      <div className="border-admin-sidebar-border flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <span className="font-display text-admin-sidebar-foreground truncate text-lg font-bold">
            Admin Console
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-admin-sidebar-foreground hover:bg-admin-sidebar-active"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <div key={item.name} className="flex flex-col space-y-1">
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-admin-sidebar-active text-admin-primary'
                      : 'text-admin-sidebar-foreground hover:bg-admin-sidebar-active/50',
                    isCollapsed ? 'justify-center' : '',
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isActive ? 'text-admin-primary' : 'text-admin-sidebar-foreground/70',
                      isCollapsed ? '' : 'mr-3',
                    )}
                    aria-hidden="true"
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
                {!isCollapsed && item.children && (
                  <div className="border-admin-sidebar-border ml-6 space-y-1 border-l pl-2">
                    {item.children.map((child) => {
                      const isChildActive =
                        pathname === child.href || pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                            isChildActive
                              ? 'bg-admin-sidebar-active text-admin-primary'
                              : 'text-admin-sidebar-foreground hover:bg-admin-sidebar-active/50',
                          )}
                        >
                          <child.icon
                            className={cn(
                              'mr-3 h-4 w-4 flex-shrink-0',
                              isChildActive
                                ? 'text-admin-primary'
                                : 'text-admin-sidebar-foreground/70',
                            )}
                            aria-hidden="true"
                          />
                          <span>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-admin-sidebar-border border-t p-4">
        <div className={cn('flex items-center', isCollapsed ? 'justify-center' : '')}>
          <div className="bg-admin-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white">
            AD
          </div>
          {!isCollapsed && (
            <div className="ml-3 truncate">
              <p className="text-admin-sidebar-foreground text-sm font-medium">Administrator</p>
              <p className="text-admin-sidebar-foreground/70 text-xs">admin@institution.edu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
