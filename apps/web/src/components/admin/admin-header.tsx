"use client"

import { Bell, Search, HelpCircle, Menu } from "lucide-react"
import { Input, Button, Avatar, AvatarFallback } from "@student-erp/ui"
import { usePathname } from "next/navigation"

export function AdminHeader() {
  const pathname = usePathname()

  // Simple breadcrumb generator based on pathname
  const segments = pathname.split("/").filter(Boolean)
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center flex-1">
        <div className="md:hidden mr-4">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1
            const text = segment.charAt(0).toUpperCase() + segment.slice(1)
            
            return (
              <div key={segment} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <span className={isLast ? "font-medium text-foreground" : ""}>
                  {text}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 bg-muted/50 border-none focus-visible:ring-admin-primary"
          />
        </div>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <HelpCircle className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-admin-primary"></span>
        </Button>
        
        <Avatar className="h-8 w-8 cursor-pointer border border-border">
          <AvatarFallback className="bg-admin-accent text-admin-accent-foreground text-xs font-medium">AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
