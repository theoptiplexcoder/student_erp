'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
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
  AlertCircle,
  DoorOpen,
  IndianRupee,
  Receipt,
  Layers,
  Users2,
  AlertOctagon,
} from 'lucide-react';
import { Button } from '@student-erp/ui';
import { cn } from '@student-erp/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Admissions', href: '/admin/admissions', icon: UserPlus },
  { name: 'Students', href: '/admin/students', icon: Users },
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
  { name: 'Academics', href: '/admin/academics', icon: BookOpen },
  { name: 'Faculty', href: '/admin/faculty', icon: Users },
  { name: 'Examinations', href: '/admin/examinations', icon: FileText },
  {
    name: 'Timetable',
    href: '/admin/timetable',
    icon: CalendarCheck,
    children: [{ name: 'Rooms', href: '/admin/administration/rooms', icon: DoorOpen }],
  },
  { name: 'Reports', href: '/admin/reports', icon: PieChart },
  { name: 'Grievances', href: '/admin/grievances', icon: AlertCircle },
  { name: 'Announcements', href: '/admin/communication/announcements', icon: Megaphone },
  { name: 'Rooms', href: '/admin/administration/rooms', icon: DoorOpen },
  { name: 'Institution', href: '/admin/administration/institution', icon: Building2 },
];

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm">
          <div className="bg-admin-sidebar fixed inset-y-0 left-0 flex h-full w-3/4 max-w-sm flex-col border-r p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-admin-sidebar-foreground text-lg font-bold">
                Admin Menu
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="text-admin-sidebar-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <nav className="space-y-1">
                {navigation.map((item: any) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <div key={item.name} className="flex flex-col space-y-1">
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'group flex items-center rounded-md px-3 py-3 text-base font-medium transition-colors',
                          isActive
                            ? 'bg-admin-sidebar-active text-admin-primary'
                            : 'text-admin-sidebar-foreground hover:bg-admin-sidebar-active/50',
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-3 h-5 w-5 flex-shrink-0',
                            isActive ? 'text-admin-primary' : 'text-admin-sidebar-foreground/70',
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                      {item.children && (
                        <div className="border-admin-sidebar-border ml-6 space-y-1 border-l pl-2">
                          {item.children.map((child: any) => {
                            const isChildActive =
                              pathname === child.href || pathname.startsWith(child.href);
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
                                {child.name}
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
          </div>
        </div>
      )}
    </div>
  );
}
