"use client";
import React from "react";
import { WelcomeBanner } from "@/features/dashboard/components/WelcomeBanner";
import { WorkQueueCard } from "@/features/dashboard/components/WorkQueueCard";
import { QuickActionCard } from "@/features/dashboard/components/QuickActionCard";
import { Activity, Clock } from "lucide-react";

function RecentActivityTimeline() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 h-full">
      <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-muted-foreground" />
        Recent Activity
      </h2>
      <div className="space-y-4">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="flex gap-4 relative">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
              {i !== 2 && <div className="w-[1px] h-full bg-border my-1" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">New student admitted</p>
              <p className="text-xs text-muted-foreground">John Doe enrolled in Computer Science program.</p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{i + 1} hours ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TenantAdminDashboard() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <WelcomeBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <WorkQueueCard />
        </div>
        <div className="flex flex-col gap-6">
          <QuickActionCard />
          <RecentActivityTimeline />
        </div>
      </div>
    </div>
  );
}
