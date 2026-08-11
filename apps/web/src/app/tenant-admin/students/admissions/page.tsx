import React from "react";
import { AdmissionsToolbar } from "../../../../features/admissions/components/AdmissionsToolbar";
import { AdmissionsFilters } from "../../../../features/admissions/components/AdmissionsFilters";
import { AdmissionCyclesList } from "../../../../features/admissions/components/AdmissionCyclesList";
import { SeatMatrixTracker } from "../../../../features/admissions/components/SeatMatrixTracker";

export default function AdmissionsDashboardPage() {
  return (
    <div className="flex flex-col h-full bg-muted/30 overflow-y-auto">
      <AdmissionsToolbar />
      <AdmissionsFilters />

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Active Campaigns</div>
            <div className="text-2xl font-bold">4</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Overall Conversion Rate</div>
            <div className="text-2xl font-bold text-emerald-600">24.5%</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Total Seats Filled (Fall '24)</div>
            <div className="text-2xl font-bold">1,420 / 2,000</div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-background shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-1">Pending Bulk Offers</div>
            <div className="text-2xl font-bold text-amber-600">350</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AdmissionCyclesList />
          </div>
          <div className="lg:col-span-1 h-[500px]">
            <SeatMatrixTracker />
          </div>
        </div>
      </div>
    </div>
  );
}
