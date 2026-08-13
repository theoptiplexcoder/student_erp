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
  PieChart,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@student-erp/ui';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Admissions', href: '/admin/admissions', icon: UserPlus },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Academics', href: '/admin/academics', icon: BookOpen },
  { name: 'Faculty', href: '/admin/faculty', icon: Users },
  { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
  { name: 'Examinations', href: '/admin/examinations', icon: FileText },
  { name: 'Promotions', href: '/admin/promotions', icon: Award },
  { name: 'Timetable', href: '/admin/timetable', icon: CalendarCheck },
  { name: 'Certificates', href: '/admin/certificates', icon: Award },
  { name: 'Reports', href: '/admin/reports', icon: PieChart },
  { name: 'Announcements', href: '/admin/communication/announcements', icon: Megaphone },
  { name: 'Institution', href: '/admin/administration/institution', icon: Building2 },
  { name: 'Settings', href: '/admin/administration/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        'bg-admin-sidebar border-admin-sidebar-border relative z-20 flex h-screen flex-col border-r transition-all duration-300',
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
              <Link
                key={item.name}
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
