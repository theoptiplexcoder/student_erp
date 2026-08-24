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
} from 'lucide-react';
import { Button } from '@student-erp/ui';
import { cn } from '@student-erp/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Admissions', href: '/admin/admissions', icon: UserPlus },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Academics', href: '/admin/academics', icon: BookOpen },
  { name: 'Faculty', href: '/admin/faculty', icon: Users },
  { name: 'Examinations', href: '/admin/examinations', icon: FileText },
  { name: 'Timetable', href: '/admin/timetable', icon: CalendarCheck },
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
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
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
