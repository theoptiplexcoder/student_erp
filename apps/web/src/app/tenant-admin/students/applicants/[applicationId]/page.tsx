import React from "react";
import { ApplicantProfileTabs } from "@/features/shared/components/ApplicantProfileTabs";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function ApplicantProfilePage({ params }: { params: { applicationId: string } }) {
  const id = params.applicationId || "APP-999";

  return (
    <div className="flex flex-col h-full bg-background p-6 gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tenant-admin/students/applicants"
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            DC
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">David Chen</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>{id}</span>
              <span>•</span>
              <span>B.Tech Electrical</span>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Verification Pending
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="text-emerald-600 flex items-center gap-1" title="Phase 1-4"><CheckCircle className="h-3 w-3"/> Application</span>
            <span className="w-3 h-px bg-border"></span>
            <span className="text-primary font-semibold flex items-center gap-1" title="Phase 5-8"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Verification & Decision</span>
            <span className="w-3 h-px bg-border"></span>
            <span title="Phase 9-11">Offers & Fees</span>
            <span className="w-3 h-px bg-border"></span>
            <span title="Phase 12-18">Enrollment Setup</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-2 border border-border bg-background rounded-md text-sm font-medium hover:bg-accent transition-colors">
              Assign Officer
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-border bg-background rounded-md text-sm font-medium hover:bg-accent transition-colors text-red-600 hover:text-red-700">
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              <CheckCircle className="h-4 w-4" />
              Verify Documents
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ApplicantProfileTabs />
      </div>
    </div>
  );
}
