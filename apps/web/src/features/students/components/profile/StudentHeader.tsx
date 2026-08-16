'use client';
import React from 'react';
import { Edit, Printer, GraduationCap, Download, MoreVertical, ChevronRight } from 'lucide-react';

export function StudentHeader({ studentId }: { studentId: string }) {
  // Normally fetch data here. Mocking for demonstration.
  const name = studentId === 'STU-2024-001' ? 'Alice Johnson' : 'Student Name';

  return (
    <div className="bg-card border-border border-b">
      {/* Breadcrumbs */}
      <div className="border-border text-muted-foreground flex items-center border-b px-6 py-3 text-sm">
        <a href="/tenant-admin/students" className="hover:text-primary transition-colors">
          Students
        </a>
        <ChevronRight className="mx-1 h-4 w-4" />
        <span className="text-foreground font-medium">{studentId}</span>
      </div>

      {/* Header Profile */}
      <div className="flex flex-col items-start justify-between gap-6 p-6 md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <div className="bg-primary/10 border-primary/20 font-display text-primary flex h-24 w-24 items-center justify-center rounded-2xl border-2 text-3xl font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="font-display text-foreground text-2xl font-bold">{name}</h1>
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-400">
                Active
              </span>
            </div>
            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
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
        <div className="flex w-full items-center gap-2 md:w-auto">
          <button className="border-border bg-background hover:bg-accent flex h-10 flex-1 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors md:flex-none">
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button className="border-border bg-background hover:bg-accent flex h-10 flex-1 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors md:flex-none">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-md shadow-sm transition-colors"
            title="Generate Certificate"
          >
            <GraduationCap className="h-4 w-4" />
          </button>
          <button
            className="border-border bg-background hover:bg-accent flex h-10 w-10 items-center justify-center rounded-md border transition-colors"
            title="More Actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
