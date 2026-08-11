import React from "react";
import { ApplicantProfileTabs } from "@/features/shared/components/ApplicantProfileTabs";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function ApplicantProfilePage({ params }: { params: { applicationId: string } }) {
  const id = params.applicationId || "APP-001";

  return (
    <div className="flex flex-col h-full bg-background p-6 gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tenant-admin/students/admissions"
            className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            AS
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alice Smith</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{id}</span>
              <span>•</span>
              <span>Applied: Mar 1, 2024</span>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Under Review
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background rounded-md text-sm font-medium hover:bg-accent transition-colors text-red-600 hover:text-red-700">
            <XCircle className="h-4 w-4" />
            Reject
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            <CheckCircle className="h-4 w-4" />
            Approve & Offer
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ApplicantProfileTabs />
      </div>
    </div>
  );
}
