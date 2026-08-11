"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@student-erp/utils"
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
} from "lucide-react"
import { useState } from "react"
import { Button } from "@student-erp/ui"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Institution", href: "/admin/institution", icon: Building2 },
  { name: "People", href: "/admin/people/students", icon: Users },
  { name: "Admissions", href: "/admin/admissions", icon: UserPlus },
  { name: "Academics", href: "/admin/academics", icon: BookOpen },
  { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { name: "Examinations", href: "/admin/examinations/exams", icon: FileText },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
  { name: "Reports", href: "/admin/reports", icon: PieChart },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Settings", href: "/admin/settings/roles", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "relative flex flex-col bg-admin-sidebar border-r border-admin-sidebar-border h-screen transition-all duration-300 z-20",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-admin-sidebar-border">
        {!isCollapsed && (
          <span className="font-display font-bold text-lg text-admin-sidebar-foreground truncate">
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
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-admin-sidebar-active text-admin-primary"
                    : "text-admin-sidebar-foreground hover:bg-admin-sidebar-active/50",
                  isCollapsed ? "justify-center" : ""
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5",
                    isActive ? "text-admin-primary" : "text-admin-sidebar-foreground/70",
                    isCollapsed ? "" : "mr-3"
                  )}
                  aria-hidden="true"
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-admin-sidebar-border">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
          <div className="h-8 w-8 rounded-full bg-admin-primary flex items-center justify-center text-white font-medium text-sm">
            AD
          </div>
          {!isCollapsed && (
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-admin-sidebar-foreground">Administrator</p>
              <p className="text-xs text-admin-sidebar-foreground/70">admin@institution.edu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
