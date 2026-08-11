"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  CalendarDays, 
  FileText, 
  GraduationCap, 
  LayoutDashboard, 
  Library, 
  MessageSquare, 
  ScrollText, 
  Settings, 
  User, 
  Users 
} from "lucide-react";
import { cn } from "@student-erp/utils";

const sidebarNavItems = [
  { title: "Dashboard", href: "/student", icon: LayoutDashboard, exact: true },
  { title: "My Profile", href: "/student/profile", icon: User },
  { title: "Timetable", href: "/student/timetable", icon: CalendarDays },
  { title: "My Courses", href: "/student/courses", icon: BookOpen },
  { title: "Calendar", href: "/student/calendar", icon: CalendarDays },
  { title: "Certificates", href: "/student/certificates", icon: GraduationCap },
  { title: "Feedback", href: "/student/feedback", icon: MessageSquare },
  { title: "Documents", href: "/student/documents", icon: FileText },
  { title: "Clubs", href: "/student/clubs", icon: Users },
  { title: "Forums", href: "/student/forums", icon: Library },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-muted/40 md:block w-64 flex-shrink-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/student" className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-display">Student Portal</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
            {sidebarNavItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    isActive 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t">
          <div className="text-xs text-muted-foreground mb-4 text-center">
            Powered by Student ERP
          </div>
        </div>
      </div>
    </div>
  );
}
