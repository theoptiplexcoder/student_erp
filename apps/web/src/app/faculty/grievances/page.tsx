'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@student-erp/ui';
import { useFacultyGrievances, useCreateFacultyGrievance } from '@student-erp/hooks';
import { AlertCircle, Plus } from 'lucide-react';
import { GrievanceForm } from '../../../components/student/grievance/grievance-form';

export default function GrievancesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading, error } = useFacultyGrievances();
  const grievances = Array.isArray(data) ? data : ((data as any)?.data ?? []);
  const createGrievance = useCreateFacultyGrievance();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grievance Management</h1>
          <p className="text-muted-foreground">Submit and track your requests and complaints.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Grievance
        </Button>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>File a Grievance</DialogTitle>
              <DialogDescription>
                Submit a grievance or report an issue to the institution.
              </DialogDescription>
            </DialogHeader>
            <GrievanceForm
              onCancel={() => setFormOpen(false)}
              onSuccess={() => setFormOpen(false)}
              submitGrievance={(values) => createGrievance.mutateAsync(values)}
              isSubmitting={createGrievance.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Grievances</CardTitle>
            <CardDescription>
              A list of your submitted grievances and their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading grievances...</p>
              ) : error ? (
                <p className="text-destructive text-sm">Failed to load grievances.</p>
              ) : grievances.length === 0 ? (
                <p className="text-muted-foreground text-sm">No grievances submitted yet.</p>
              ) : (
                grievances.map((grievance: any) => (
                  <div
                    key={grievance.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary rounded-full p-2">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{grievance.subject}</p>
                        <p className="text-muted-foreground text-sm">
                          Submitted {format(new Date(grievance.createdAt), 'MMM d, yyyy')} ·{' '}
                          {grievance.category}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                      {String(grievance.status || 'OPEN').replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
              {/*
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
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
