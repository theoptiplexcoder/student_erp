'use client';
import React from 'react';
import { PieChart, Download, AlertCircle } from 'lucide-react';

export function SeatMatrixTracker() {
  return (
    <div className="bg-background border-border flex h-full flex-col overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border bg-muted/5 flex items-center justify-between border-b p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">Seat Matrix & Quotas</h2>
        <button className="border-border bg-background hover:bg-accent flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium">
          <Download className="h-3 w-3" /> Export
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
        {/* Overall Capacity Alert */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-500">
              Computer Science Quota Near Capacity
            </h4>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              General quota for B.Tech CS is at 95% capacity. Consider halting automated offers.
            </p>
          </div>
        </div>

        {/* Seat Breakdown */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-medium">
            B.Tech Engineering Matrix (Fall 2024)
          </h3>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span>General Merit (60%)</span>
                <span>285 / 300 Seats</span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div className="h-full bg-amber-500" style={{ width: '95%' }}></div>
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span>Management Quota (20%)</span>
                <span>45 / 100 Seats</span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div className="h-full bg-emerald-500" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span>Reserved Categories (20%)</span>
                <span>80 / 100 Seats</span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div className="bg-primary h-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-border mt-auto border-t pt-4">
          <button className="border-border bg-background hover:bg-accent w-full rounded-md border py-2 text-sm font-medium transition-colors">
            Manage Quota Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
