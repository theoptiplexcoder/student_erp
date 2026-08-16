import React from 'react';
import { ApplicantToolbar } from '../../../../features/applicants/components/ApplicantToolbar';
import { ApplicantFilters } from '../../../../features/applicants/components/ApplicantFilters';
import { ApplicantsTable } from '../../../../features/applicants/components/ApplicantsTable';

export default function ApplicantsDashboardPage() {
  return (
    <div className="bg-background flex h-full flex-col">
      <ApplicantToolbar />
      <ApplicantFilters />

      <div className="border-border bg-muted/10 grid grid-cols-1 gap-4 border-b p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
          <div className="text-muted-foreground mb-1 text-sm font-medium">
            Applications Awaiting Review
          </div>
          <div className="text-2xl font-bold">45</div>
        </div>
        <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
          <div className="text-muted-foreground mb-1 text-sm font-medium">
            Documents Pending Verification
          </div>
          <div className="text-2xl font-bold">112</div>
        </div>
        <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
          <div className="text-muted-foreground mb-1 text-sm font-medium">
            Offers Awaiting Acceptance
          </div>
          <div className="text-2xl font-bold">18</div>
        </div>
        <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
          <div className="text-muted-foreground mb-1 text-sm font-medium">Ready for Enrollment</div>
          <div className="text-2xl font-bold text-emerald-600">8</div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <ApplicantsTable />

        <div className="border-border bg-background mt-auto flex items-center justify-between border-t p-4">
          <div className="text-muted-foreground text-sm">Showing 1 to 10 of 430 applicants</div>
          <div className="flex gap-2">
            <button className="hover:bg-muted rounded border px-3 py-1 text-sm" disabled>
              Previous
            </button>
            <button className="bg-primary text-primary-foreground rounded border px-3 py-1 text-sm">
              1
            </button>
            <button className="hover:bg-muted rounded border px-3 py-1 text-sm">2</button>
            <button className="hover:bg-muted rounded border px-3 py-1 text-sm">3</button>
            <button className="hover:bg-muted rounded border px-3 py-1 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
