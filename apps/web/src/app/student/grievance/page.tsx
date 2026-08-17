'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@student-erp/ui';
import { GrievanceForm } from '../../../components/student/grievance/grievance-form';

export default function GrievancePage() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">File a Grievance</h1>
        <p className="text-muted-foreground mt-1">
          Submit a grievance or report an issue to the institution.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grievance Details</CardTitle>
          <CardDescription>
            Please provide accurate and detailed information to help us address your concern.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GrievanceForm />
        </CardContent>
      </Card>
    </div>
  );
}
