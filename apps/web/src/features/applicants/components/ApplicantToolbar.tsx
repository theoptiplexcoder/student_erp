'use client';
import React from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  RefreshCw,
  LayoutGrid,
} from 'lucide-react';

export function ApplicantToolbar() {
  return (
    <div className="bg-background/95 border-border sticky top-[64px] z-20 flex flex-col items-start justify-between gap-4 border-b p-4 backdrop-blur-sm sm:flex-row sm:items-center">
      <div className="group relative w-full max-w-md flex-1">
        <Search className="text-muted-foreground group-focus-within:text-primary absolute top-2.5 left-3 h-4 w-4 transition-colors" />
        <input
          type="text"
          placeholder="Search by Name, App No, Mobile, Gov ID..."
          className="border-input bg-muted/50 focus:bg-background focus:ring-primary h-9 w-full rounded-md border pr-4 pl-9 text-sm transition-all focus:ring-1 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="text-muted-foreground hover:text-foreground hover:bg-accent hidden h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors sm:flex">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <button className="text-muted-foreground hover:text-foreground hover:bg-accent hidden h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors sm:flex">
          <LayoutGrid className="h-4 w-4" />
          Saved Views
        </button>
        <div className="bg-border mx-1 hidden h-6 w-px sm:block"></div>
        <button className="border-border bg-background hover:bg-accent hover:text-accent-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button className="border-border bg-background hover:bg-accent hover:text-accent-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium shadow-sm transition-colors">
          <Plus className="h-4 w-4" />
          New Applicant
        </button>
        <button className="border-border bg-background hover:bg-accent flex h-9 w-9 items-center justify-center rounded-md border text-sm transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
