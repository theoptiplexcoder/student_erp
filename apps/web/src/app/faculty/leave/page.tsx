'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@student-erp/ui';
import { CalendarOff, Plus } from 'lucide-react';

export default function LeaveManagementPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">Request time off and manage your timetable substitutions.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Leave Requests</CardTitle>
            <CardDescription>Track the status of your past and upcoming leave requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <CalendarOff className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Casual Leave</p>
                    <p className="text-sm text-muted-foreground">Nov 15, 2023 to Nov 16, 2023</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">Substitute: Dr. Smith</div>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-yellow-600 bg-yellow-100 border-transparent">
                    Pending Approval
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
