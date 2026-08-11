"use client";
import React from "react";
import { PieChart, Download, AlertCircle } from "lucide-react";

export function SeatMatrixTracker() {
  return (
    <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/5">
         <h2 className="text-lg font-semibold flex items-center gap-2">
            Seat Matrix & Quotas
         </h2>
         <button className="text-xs font-medium border border-border px-2 py-1 rounded bg-background hover:bg-accent flex items-center gap-1">
            <Download className="h-3 w-3" /> Export
         </button>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-6 overflow-y-auto">
         {/* Overall Capacity Alert */}
         <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/10 dark:border-amber-900/30">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
               <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-500">Computer Science Quota Near Capacity</h4>
               <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">General quota for B.Tech CS is at 95% capacity. Consider halting automated offers.</p>
            </div>
         </div>

         {/* Seat Breakdown */}
         <div className="space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">B.Tech Engineering Matrix (Fall 2024)</h3>
            
            <div className="space-y-3">
               <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                     <span>General Merit (60%)</span>
                     <span>285 / 300 Seats</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500" style={{ width: '95%' }}></div>
                  </div>
               </div>

               <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                     <span>Management Quota (20%)</span>
                     <span>45 / 100 Seats</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500" style={{ width: '45%' }}></div>
                  </div>
               </div>
               
               <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                     <span>Reserved Categories (20%)</span>
                     <span>80 / 100 Seats</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-primary" style={{ width: '80%' }}></div>
                  </div>
               </div>
            </div>
         </div>

         <div className="mt-auto border-t border-border pt-4">
            <button className="w-full py-2 text-sm font-medium border border-border bg-background rounded-md hover:bg-accent transition-colors">
               Manage Quota Configuration
            </button>
         </div>
      </div>
    </div>
  );
}
