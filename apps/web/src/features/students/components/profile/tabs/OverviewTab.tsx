"use client";
import React from "react";
import { Phone, Mail, MapPin, CreditCard, CalendarDays, FileCheck } from "lucide-react";

export function OverviewTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Quick Contact Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Contact Snapshot</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-foreground">+1 555-0101</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-foreground">alice.j@example.com</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-foreground">123 University Ave, NY</span>
          </div>
        </div>
      </div>

      {/* Academic Status */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Academic Status</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Current CGPA</span>
            <span className="font-semibold text-foreground">3.8 / 4.0</span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Attendance</span>
            <span className="font-semibold text-green-600">92%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Credits Earned</span>
            <span className="font-semibold text-foreground">48 / 120</span>
          </div>
        </div>
      </div>

      {/* Financial Status */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Financial & Docs</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-foreground font-medium">No Dues Pending</span>
              <span className="text-xs text-muted-foreground">Current semester paid</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileCheck className="h-4 w-4 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-foreground font-medium">1 Document Missing</span>
              <span className="text-xs text-muted-foreground">Original Marksheet pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
