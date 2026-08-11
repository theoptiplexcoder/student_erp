"use client";

import React from "react";
import Link from "next/link";
import { Bell, Menu, User, Settings, LogOut } from "lucide-react";
import { currentStudent } from "@/lib/mock/student/data";
import { Button } from "@student-erp/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@student-erp/ui";

export function StudentNavbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      
      <div className="w-full flex-1">
        {/* Optional Page Title or Breadcrumb can go here */}
      </div>
      
      <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/student/notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-600"></span>
            <span className="sr-only">Toggle notifications</span>
          </Link>
        </Button>
        
        {/* Replace with DropdownMenu when available in ui package or use a standard approach */}
        <div className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted rounded-md transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentStudent.avatarUrl} alt={currentStudent.name} />
            <AvatarFallback>{currentStudent.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-sm">
            <span className="font-medium leading-none">{currentStudent.name}</span>
            <span className="text-xs text-muted-foreground mt-1">{currentStudent.id}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
