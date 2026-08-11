"use client";
import React from "react";
import { Users, MoreHorizontal, Settings, FileSpreadsheet } from "lucide-react";

const mockCycles = [
  { id: "CYC-24-ENG", name: "Fall 2024 Engineering", status: "Active", startDate: "Jan 1, 2024", endDate: "Aug 15, 2024", applicants: 1250, offers: 450, enrolled: 320, capacity: 500 },
  { id: "CYC-24-MBA", name: "Spring 2024 MBA", status: "Closed", startDate: "Oct 1, 2023", endDate: "Feb 28, 2024", applicants: 850, offers: 200, enrolled: 180, capacity: 180 },
  { id: "CYC-25-SCI", name: "Fall 2025 Sciences", status: "Draft", startDate: "Jan 1, 2025", endDate: "Aug 15, 2025", applicants: 0, offers: 0, enrolled: 0, capacity: 300 },
];

export function AdmissionCyclesList() {
  return (
    <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/5">
         <h2 className="text-lg font-semibold flex items-center gap-2">
            Admission Campaigns
         </h2>
         <button className="text-xs font-medium text-primary hover:underline">View All</button>
      </div>
      
      <div className="overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Campaign Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Timeline</th>
              <th className="px-4 py-3 font-medium">Funnel (App / Off / Enr)</th>
              <th className="px-4 py-3 font-medium">Capacity Fill</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockCycles.map((cycle) => {
              const fillPercentage = cycle.capacity > 0 ? Math.round((cycle.enrolled / cycle.capacity) * 100) : 0;
              
              return (
                <tr key={cycle.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary cursor-pointer hover:underline">{cycle.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cycle.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${cycle.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                      ${cycle.status === 'Closed' ? 'bg-muted text-muted-foreground' : ''}
                      ${cycle.status === 'Draft' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                    `}>
                      {cycle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    <div>{cycle.startDate}</div>
                    <div>to {cycle.endDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium">
                       <span title="Applicants">{cycle.applicants}</span> /
                       <span title="Offers Generated" className="text-amber-600">{cycle.offers}</span> /
                       <span title="Enrolled Students" className="text-emerald-600">{cycle.enrolled}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-24">
                          <div 
                             className={`h-full ${fillPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                             style={{width: `${Math.min(fillPercentage, 100)}%`}}
                          ></div>
                       </div>
                       <span className="text-xs font-medium w-8 text-right">{fillPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button title="Merit Lists" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                         <FileSpreadsheet className="h-4 w-4" />
                       </button>
                       <button title="Settings" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                         <Settings className="h-4 w-4" />
                       </button>
                       <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                         <MoreHorizontal className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
