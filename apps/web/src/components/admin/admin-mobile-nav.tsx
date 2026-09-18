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
  Megaphone,
  Settings,
  AlertCircle,
  DoorOpen,
  IndianRupee,
  Receipt,
  Layers,
  Users2,
  AlertOctagon,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@student-erp/ui';
import { cn } from '@student-erp/utils';

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

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="h-8 w-8">
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm">
          <div className="bg-card border-border/80 fixed inset-y-0 left-0 flex h-full w-4/5 max-w-xs flex-col border-r p-4 shadow-xl">
            <div className="border-border/60 mb-4 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Student ERP" className="h-6 w-6 object-contain" />
                <span className="font-display text-foreground text-sm font-bold">Student ERP</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <nav className="space-y-4">
                {navigationSections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    {section.title && (
                      <div className="text-muted-foreground/70 px-2 pb-1 text-[10px] font-semibold tracking-wider uppercase">
                        {section.title}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                          <div key={item.name} className="flex flex-col space-y-1">
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors',
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
                              {item.name}
                            </Link>
                            {item.children && (
                              <div className="border-border/60 ml-4 space-y-0.5 border-l pl-2">
                                {item.children.map((child) => {
                                  const isChildActive = pathname === child.href;
                                  return (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      onClick={() => setOpen(false)}
                                      className={cn(
                                        'group flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors',
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
                                            : 'text-muted-foreground/70',
                                        )}
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
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
