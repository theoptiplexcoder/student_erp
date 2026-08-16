'use client';
import React from 'react';
import { Plus, Download, RefreshCw, LayoutGrid, Calendar, Target } from 'lucide-react';

export function AdmissionsToolbar() {
  return (
    <div className="bg-background/95 border-border sticky top-[64px] z-20 flex flex-col items-start justify-between gap-4 border-b p-4 backdrop-blur-sm sm:flex-row sm:items-center">
      <div className="flex-1">
        <h1 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
          <Target className="text-primary h-5 w-5" />
          Admission Campaigns
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage cycles, monitor quotas, and track enrollment pipelines.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="text-muted-foreground hover:text-foreground hover:bg-accent hidden h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors sm:flex">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <div className="bg-border mx-1 hidden h-6 w-px sm:block"></div>
        <button className="border-border bg-background hover:bg-accent hover:text-accent-foreground flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Reports</span>
        </button>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium shadow-sm transition-colors">
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>
    </div>
  );
}
