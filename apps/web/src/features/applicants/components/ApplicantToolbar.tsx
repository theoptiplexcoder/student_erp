"use client";
import React from "react";
import { Search, Plus, Upload, Download, MoreHorizontal, RefreshCw, LayoutGrid } from "lucide-react";

export function ApplicantToolbar() {
  return (
    <div className="sticky top-[64px] z-20 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex-1 w-full max-w-md relative group">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search by Name, App No, Mobile, Gov ID..." 
          className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-muted/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <button className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <button className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <LayoutGrid className="h-4 w-4" />
          Saved Views
        </button>
        <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
        <button className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <button className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </button>
        <button className="flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          New Applicant
        </button>
        <button className="flex items-center justify-center h-9 w-9 rounded-md border border-border bg-background text-sm hover:bg-accent transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
