"use client";
import React from "react";
import { Edit, Printer, GraduationCap, Download, MoreVertical, ChevronRight } from "lucide-react";

export function StudentHeader({ studentId }: { studentId: string }) {
  // Normally fetch data here. Mocking for demonstration.
  const name = studentId === "STU-2024-001" ? "Alice Johnson" : "Student Name";
  
  return (
    <div className="bg-card border-b border-border">
      {/* Breadcrumbs */}
      <div className="px-6 py-3 border-b border-border flex items-center text-sm text-muted-foreground">
        <a href="/tenant-admin/students" className="hover:text-primary transition-colors">Students</a>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium">{studentId}</span>
      </div>
      
      {/* Header Profile */}
      <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl font-display font-bold text-primary">
            {name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-bold text-foreground">{name}</h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
              <span className="font-mono">{studentId}</span>
              <span className="hidden sm:inline">•</span>
              <span>B.Tech Computer Science</span>
              <span className="hidden sm:inline">•</span>
              <span>3rd Semester</span>
              <span className="hidden sm:inline">•</span>
              <span>Batch 2024</span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent transition-colors">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button className="flex items-center justify-center h-10 w-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm" title="Generate Certificate">
            <GraduationCap className="h-4 w-4" />
          </button>
          <button className="flex items-center justify-center h-10 w-10 rounded-md border border-border bg-background hover:bg-accent transition-colors" title="More Actions">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
