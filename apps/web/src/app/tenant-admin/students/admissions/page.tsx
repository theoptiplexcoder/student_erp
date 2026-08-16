import React from 'react';
import { AdmissionsToolbar } from '../../../../features/admissions/components/AdmissionsToolbar';
import { AdmissionsFilters } from '../../../../features/admissions/components/AdmissionsFilters';
import { AdmissionCyclesList } from '../../../../features/admissions/components/AdmissionCyclesList';
import { SeatMatrixTracker } from '../../../../features/admissions/components/SeatMatrixTracker';

export default function AdmissionsDashboardPage() {
  return (
    <div className="bg-muted/30 flex h-full flex-col overflow-y-auto">
      <AdmissionsToolbar />
      <AdmissionsFilters />

      <div className="p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Total Active Campaigns
            </div>
            <div className="text-2xl font-bold">4</div>
          </div>
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Overall Conversion Rate
            </div>
            <div className="text-2xl font-bold text-emerald-600">24.5%</div>
          </div>
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Total Seats Filled (Fall '24)
            </div>
            <div className="text-2xl font-bold">1,420 / 2,000</div>
          </div>
          <div className="border-border bg-background rounded-xl border p-4 shadow-sm">
            <div className="text-muted-foreground mb-1 text-sm font-medium">
              Pending Bulk Offers
            </div>
            <div className="text-2xl font-bold text-amber-600">350</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AdmissionCyclesList />
          </div>
          <div className="h-[500px] lg:col-span-1">
            <SeatMatrixTracker />
          </div>
        </div>
      </div>
    </div>
  );
}
