import React from 'react';
import { ApplicantProfileTabs } from '@/features/shared/components/ApplicantProfileTabs';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ApplicantProfilePage({ params }: { params: { applicationId: string } }) {
  const id = params.applicationId || 'APP-999';

  return (
    <div className="bg-background flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/tenant-admin/students/applicants"
            className="hover:bg-muted text-muted-foreground rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
            DC
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">David Chen</h1>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span>{id}</span>
              <span>•</span>
              <span>B.Tech Electrical</span>
              <span>•</span>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Verification Pending
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="text-muted-foreground hidden items-center gap-2 text-xs font-medium md:flex">
            <span className="flex items-center gap-1 text-emerald-600" title="Phase 1-4">
              <CheckCircle className="h-3 w-3" /> Application
            </span>
            <span className="bg-border h-px w-3"></span>
            <span className="text-primary flex items-center gap-1 font-semibold" title="Phase 5-8">
              <span className="bg-primary h-1.5 w-1.5 rounded-full"></span> Verification & Decision
            </span>
            <span className="bg-border h-px w-3"></span>
            <span title="Phase 9-11">Offers & Fees</span>
            <span className="bg-border h-px w-3"></span>
            <span title="Phase 12-18">Enrollment Setup</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="border-border bg-background hover:bg-accent rounded-md border px-3 py-2 text-sm font-medium transition-colors">
              Assign Officer
            </button>
            <button className="border-border bg-background hover:bg-accent inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700">
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors">
              <CheckCircle className="h-4 w-4" />
              Verify Documents
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ApplicantProfileTabs />
      </div>
    </div>
  );
}
