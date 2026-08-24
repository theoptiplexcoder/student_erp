'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@student-erp/ui';
import { useAdminGrievance, useUpdateGrievanceStatus } from '@/hooks/api/admin/useGrievances';
import { format } from 'date-fns';
import { ArrowLeft, Loader2, User, Building } from 'lucide-react';

export default function AdminGrievanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: grievance, isLoading, error } = useAdminGrievance(id);
  const updateStatus = useUpdateGrievanceStatus();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !grievance) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-destructive">Failed to load grievance details.</p>
        <Link href="/admin/grievances">
          <Button variant="outline">Back to Grievances</Button>
        </Link>
      </div>
    );
  }

  const creatorName =
    grievance.source === 'STUDENT'
      ? `${grievance.student?.user?.firstName || ''} ${grievance.student?.user?.lastName || ''}`
      : `${grievance.faculty?.user?.firstName || ''} ${grievance.faculty?.user?.lastName || ''}`;
  const creatorIdentifier =
    grievance.source === 'STUDENT'
      ? grievance.student?.studentCode || grievance.student?.admissionNumber
      : grievance.faculty?.teacherCode;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/grievances">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grievance Details</h1>
          <p className="text-muted-foreground">ID: {grievance.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{grievance.subject}</CardTitle>
                <CardDescription>
                  Submitted on {format(new Date(grievance.createdAt), 'MMMM dd, yyyy')}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {grievance.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm whitespace-pre-wrap">{grievance.description}</p>
            </div>

            {grievance.relatedType && grievance.relatedId && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Related Record</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{grievance.relatedType}</Badge>
                  <span className="text-muted-foreground text-xs">{grievance.relatedId}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-2 text-sm">Current Status</p>
                <Badge
                  className="text-sm"
                  variant={
                    grievance.status === 'OPEN'
                      ? 'destructive'
                      : grievance.status === 'RESOLVED'
                        ? 'default'
                        : 'outline'
                  }
                >
                  {grievance.status}
                </Badge>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 text-sm">Priority</p>
                <Badge
                  className="text-sm"
                  variant={
                    grievance.priority === 'URGENT' || grievance.priority === 'HIGH'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {grievance.priority}
                </Badge>
              </div>

              <div className="space-y-2 pt-4">
                <p className="text-muted-foreground text-sm">Update Status</p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={updateStatus.isPending || grievance.status === 'IN_PROGRESS'}
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                  >
                    Mark as In Progress
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={updateStatus.isPending || grievance.status === 'RESOLVED'}
                    onClick={() => handleStatusChange('RESOLVED')}
                  >
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive w-full justify-start"
                    disabled={updateStatus.isPending || grievance.status === 'CLOSED'}
                    onClick={() => handleStatusChange('CLOSED')}
                  >
                    Close Grievance
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Creator Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  {grievance.source === 'STUDENT' ? (
                    <User className="text-primary h-5 w-5" />
                  ) : (
                    <Building className="text-primary h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{grievance.isAnonymous ? 'Anonymous' : creatorName}</p>
                  <p className="text-muted-foreground text-xs">
                    {grievance.source}{' '}
                    {grievance.isAnonymous ? '' : `• ${creatorIdentifier || 'N/A'}`}
                  </p>
                </div>
              </div>

              {!grievance.isAnonymous &&
                grievance.source === 'STUDENT' &&
                grievance.student?.user?.email && (
                  <div className="border-t pt-2">
                    <p className="text-muted-foreground text-xs">Contact</p>
                    <p className="text-sm">{grievance.student.user.email}</p>
                    {grievance.student.user.phone && (
                      <p className="text-sm">{grievance.student.user.phone}</p>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
