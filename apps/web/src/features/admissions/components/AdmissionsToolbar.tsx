"use client";
import React from "react";
import { Plus, Download, RefreshCw, LayoutGrid, Calendar, Target } from "lucide-react";

export function AdmissionsToolbar() {
  return (
    <div className="sticky top-[64px] z-20 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
           <Target className="h-5 w-5 text-primary" />
           Admission Campaigns
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage cycles, monitor quotas, and track enrollment pipelines.</p>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <button className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
        <button className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Reports</span>
        </button>
        <button className="flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>
    </div>
  );
}
