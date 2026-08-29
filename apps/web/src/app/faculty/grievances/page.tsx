'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Textarea } from '@student-erp/ui';
import { AlertCircle, Plus } from 'lucide-react';

export default function GrievancesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grievance Management</h1>
          <p className="text-muted-foreground">Submit and track your requests and complaints.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Grievance
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Grievances</CardTitle>
            <CardDescription>A list of your submitted grievances and their current status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Projector not working in Room 102</p>
                    <p className="text-sm text-muted-foreground">Submitted on Oct 12, 2023 - Maintenance</p>
                  </div>
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-yellow-600 bg-yellow-100 border-transparent">
                  In Progress
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Leave Encashment Issue</p>
                    <p className="text-sm text-muted-foreground">Submitted on Sep 28, 2023 - HR</p>
                  </div>
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-green-600 bg-green-100 border-transparent">
                  Resolved
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
