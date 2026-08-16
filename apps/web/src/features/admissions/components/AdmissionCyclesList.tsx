'use client';
import React from 'react';
import { Users, MoreHorizontal, Settings, FileSpreadsheet } from 'lucide-react';

const mockCycles = [
  {
    id: 'CYC-24-ENG',
    name: 'Fall 2024 Engineering',
    status: 'Active',
    startDate: 'Jan 1, 2024',
    endDate: 'Aug 15, 2024',
    applicants: 1250,
    offers: 450,
    enrolled: 320,
    capacity: 500,
  },
  {
    id: 'CYC-24-MBA',
    name: 'Spring 2024 MBA',
    status: 'Closed',
    startDate: 'Oct 1, 2023',
    endDate: 'Feb 28, 2024',
    applicants: 850,
    offers: 200,
    enrolled: 180,
    capacity: 180,
  },
  {
    id: 'CYC-25-SCI',
    name: 'Fall 2025 Sciences',
    status: 'Draft',
    startDate: 'Jan 1, 2025',
    endDate: 'Aug 15, 2025',
    applicants: 0,
    offers: 0,
    enrolled: 0,
    capacity: 300,
  },
];

export function AdmissionCyclesList() {
  return (
    <div className="bg-background border-border flex flex-col overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border bg-muted/5 flex items-center justify-between border-b p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">Admission Campaigns</h2>
        <button className="text-primary text-xs font-medium hover:underline">View All</button>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted-foreground bg-muted/30 border-border border-b text-xs uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Campaign Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Timeline</th>
              <th className="px-4 py-3 font-medium">Funnel (App / Off / Enr)</th>
              <th className="px-4 py-3 font-medium">Capacity Fill</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockCycles.map((cycle) => {
              const fillPercentage =
                cycle.capacity > 0 ? Math.round((cycle.enrolled / cycle.capacity) * 100) : 0;

              return (
                <tr
                  key={cycle.id}
                  className="border-border hover:bg-muted/30 group border-b transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="text-primary cursor-pointer font-semibold hover:underline">
                      {cycle.name}
                    </div>
                    <div className="text-muted-foreground mt-0.5 text-xs">{cycle.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cycle.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''} ${cycle.status === 'Closed' ? 'bg-muted text-muted-foreground' : ''} ${cycle.status === 'Draft' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''} `}
                    >
                      {cycle.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    <div>{cycle.startDate}</div>
                    <div>to {cycle.endDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span title="Applicants">{cycle.applicants}</span> /
                      <span title="Offers Generated" className="text-amber-600">
                        {cycle.offers}
                      </span>{' '}
                      /
                      <span title="Enrolled Students" className="text-emerald-600">
                        {cycle.enrolled}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted h-2 w-24 flex-1 overflow-hidden rounded-full">
                        <div
                          className={`h-full ${fillPercentage >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-xs font-medium">{fillPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Merit Lists"
                        className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </button>
                      <button
                        title="Settings"
                        className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
