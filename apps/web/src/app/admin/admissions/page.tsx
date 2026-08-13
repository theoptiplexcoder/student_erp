'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@student-erp/ui';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';
import { Users, UserPlus, Clock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdmissionsPage() {
  const { data: applicantsData, isLoading } = useAdminStudents(1, 1, '', 'APPLICANT');
  // Just use total for a metric card. For a real dashboard, we'd have a dedicated summary endpoint.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Admissions Overview</h1>
          <p className="text-muted-foreground mt-1">Review and process student applications.</p>
        </div>
        <Button
          asChild
          className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground"
        >
          <Link href="/admin/admissions/applications">
            View All Applications <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{applicantsData?.meta.total || 0}</div>
            )}
            <p className="text-muted-foreground pt-1 text-xs">Currently awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for admissions processing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/admissions/applications">
                <Users className="mr-2 h-4 w-4" /> Browse Applicants
              </Link>
            </Button>
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" /> Add New Applicant Manually
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
