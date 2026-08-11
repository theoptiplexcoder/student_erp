import React from "react";
import { ApplicantToolbar } from "../../../../features/applicants/components/ApplicantToolbar";
import { ApplicantFilters } from "../../../../features/applicants/components/ApplicantFilters";
import { ApplicantsTable } from "../../../../features/applicants/components/ApplicantsTable";

export default function ApplicantsDashboardPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <ApplicantToolbar />
      <ApplicantFilters />

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-border bg-muted/10">
        <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-1">Applications Awaiting Review</div>
          <div className="text-2xl font-bold">45</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-1">Documents Pending Verification</div>
          <div className="text-2xl font-bold">112</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-1">Offers Awaiting Acceptance</div>
          <div className="text-2xl font-bold">18</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
          <div className="text-sm font-medium text-muted-foreground mb-1">Ready for Enrollment</div>
          <div className="text-2xl font-bold text-emerald-600">8</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <ApplicantsTable />

        <div className="mt-auto border-t border-border p-4 flex items-center justify-between bg-background">
          <div className="text-sm text-muted-foreground">Showing 1 to 10 of 430 applicants</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted" disabled>Previous</button>
            <button className="px-3 py-1 border rounded text-sm bg-primary text-primary-foreground">1</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted">2</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted">3</button>
            <button className="px-3 py-1 border rounded text-sm hover:bg-muted">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
