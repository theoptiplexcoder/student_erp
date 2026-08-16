import React from 'react';
import { ApplicantProfileTabs } from '@/features/shared/components/ApplicantProfileTabs';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ApplicantProfilePage({ params }: { params: { applicationId: string } }) {
  const id = params.applicationId || 'APP-001';

  return (
    <div className="bg-background flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/tenant-admin/students/admissions"
            className="hover:bg-muted text-muted-foreground rounded-full p-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
            AS
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alice Smith</h1>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>{id}</span>
              <span>•</span>
              <span>Applied: Mar 1, 2024</span>
              <span>•</span>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Under Review
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="border-border bg-background hover:bg-accent inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700">
            <XCircle className="h-4 w-4" />
            Reject
          </button>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors">
            <CheckCircle className="h-4 w-4" />
            Approve & Offer
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <ApplicantProfileTabs />
      </div>
    </div>
  );
}
