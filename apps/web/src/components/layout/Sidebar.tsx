"use client";
import React, { useState } from "react";
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, Building2, 
  Wallet, Megaphone, Settings, FileText, ChevronDown, ShieldCheck, CalendarClock
} from "lucide-react";

const sidebarGroups = [
  {
    title: "Dashboard",
    items: [
      { name: "Overview", icon: LayoutDashboard, href: "/tenant-admin" }
    ]
  },
  {
    title: "Student Management",
    items: [
      { name: "All Students", icon: Users, href: "/tenant-admin/students" },
      { name: "Admissions", icon: FileText, href: "/tenant-admin/students/admissions" },
      { name: "Applicants", icon: Users, href: "/tenant-admin/students/applicants" },
      { name: "Enrollment", icon: BookOpen, href: "#" },
      { name: "Academic History", icon: BookOpen, href: "#" },
      { name: "Certificates", icon: GraduationCap, href: "#" }
    ]
  },
  {
    title: "Academic",
    items: [
      { name: "Programs", icon: BookOpen, href: "#" },
      { name: "Departments", icon: Building2, href: "#" },
      { name: "Courses", icon: BookOpen, href: "#" },
      { name: "Subjects", icon: BookOpen, href: "#" },
      { name: "Sections", icon: Users, href: "#" },
      { name: "Timetable", icon: CalendarClock, href: "#" },
      { name: "Attendance", icon: Users, href: "#" }
    ]
  },
  {
    title: "Faculty",
    items: [
      { name: "Faculty", icon: Users, href: "#" },
      { name: "Assignments", icon: FileText, href: "#" },
      { name: "Leave", icon: CalendarClock, href: "#" },
      { name: "Performance", icon: ShieldCheck, href: "#" }
    ]
  },
  {
    title: "Examination",
    items: [
      { name: "Exams", icon: FileText, href: "#" },
      { name: "Marks", icon: FileText, href: "#" },
      { name: "Results", icon: FileText, href: "#" },
      { name: "Promotions", icon: GraduationCap, href: "#" }
    ]
  },
  {
    title: "Finance",
    items: [
      { name: "Fee Structures", icon: Wallet, href: "#" },
      { name: "Collections", icon: Wallet, href: "#" },
      { name: "Scholarships", icon: GraduationCap, href: "#" }
    ]
  },
  {
    title: "Communication",
    items: [
      { name: "Announcements", icon: Megaphone, href: "#" },
      { name: "Notifications", icon: Megaphone, href: "#" }
    ]
  },
  {
    title: "Administration",
    items: [
      { name: "Users", icon: Users, href: "#" },
      { name: "Roles", icon: ShieldCheck, href: "#" },
      { name: "Permissions", icon: ShieldCheck, href: "#" },
      { name: "Audit Logs", icon: FileText, href: "#" }
    ]
  },
  {
    title: "Institution",
    items: [
      { name: "Campus", icon: Building2, href: "#" },
      { name: "Academic Calendar", icon: CalendarClock, href: "#" },
      { name: "Branding", icon: Settings, href: "#" },
      { name: "Settings", icon: Settings, href: "#" }
    ]
  },
  {
    title: "Reports",
    items: [
      { name: "Reports", icon: FileText, href: "#" }
    ]
  }
];

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  // Hardcode active for shell demo
  const activeRoute = "Overview";
  const [expandedGroups, setExpandedGroups] = useState<string[]>(sidebarGroups.map(g => g.title));

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) ? prev.filter(g => g !== title) : [...prev, title]
    );
  };

  return (
    <aside 
      className={`fixed lg:sticky top-[64px] left-0 z-30 h-[calc(100vh-64px)] border-r border-border bg-sidebar overflow-y-auto transition-all duration-300 ease-in-out hidden lg:block ${collapsed ? 'w-[72px]' : 'w-[280px]'}`}
    >
      <div className="py-4 flex flex-col gap-6 px-3">
        {sidebarGroups.map((group, idx) => {
          const isExpanded = expandedGroups.includes(group.title);
          return (
            <div key={idx} className="flex flex-col gap-1">
              {!collapsed && (
                <button 
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 hover:text-foreground transition-colors"
                >
                  {group.title}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
              
              <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-200 ${!isExpanded && !collapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
                {group.items.map((item, itemIdx) => {
                  const isActive = activeRoute === item.name;
                  return (
                    <a
                      key={itemIdx}
                      href={item.href}
                      className={`
                        flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                        ${collapsed ? 'justify-center' : 'justify-start'}
                        ${isActive 
                          ? 'bg-primary/10 text-primary font-semibold' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                      {!collapsed && <span>{item.name}</span>}
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
