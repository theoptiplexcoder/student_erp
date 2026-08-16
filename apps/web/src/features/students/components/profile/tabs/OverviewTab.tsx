'use client';
import React from 'react';
import { Phone, Mail, MapPin, CreditCard, CalendarDays, FileCheck } from 'lucide-react';

export function OverviewTab() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Quick Contact Card */}
      <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
        <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
          Contact Snapshot
        </h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <Phone className="text-primary h-4 w-4" />
            <span className="text-foreground">+1 555-0101</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="text-primary h-4 w-4" />
            <span className="text-foreground">alice.j@example.com</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-primary h-4 w-4" />
            <span className="text-foreground">123 University Ave, NY</span>
          </div>
        </div>
      </div>

      {/* Academic Status */}
      <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
        <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
          Academic Status
        </h3>
        <div className="space-y-4 text-sm">
          <div className="border-border flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Current CGPA</span>
            <span className="text-foreground font-semibold">3.8 / 4.0</span>
          </div>
          <div className="border-border flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground">Attendance</span>
            <span className="font-semibold text-green-600">92%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Credits Earned</span>
            <span className="text-foreground font-semibold">48 / 120</span>
          </div>
        </div>
      </div>

      {/* Financial Status */}
      <div className="bg-card border-border rounded-xl border p-5 shadow-sm">
        <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
          Financial & Docs
        </h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <CreditCard className="h-4 w-4 text-green-500" />
            <div className="flex flex-col">
              <span className="text-foreground font-medium">No Dues Pending</span>
              <span className="text-muted-foreground text-xs">Current semester paid</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileCheck className="h-4 w-4 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-foreground font-medium">1 Document Missing</span>
              <span className="text-muted-foreground text-xs">Original Marksheet pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
