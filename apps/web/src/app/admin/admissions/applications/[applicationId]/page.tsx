'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@student-erp/ui';
import {
  useAdminApplications,
  useAdminUpdateApplication,
  useAdminConvertApplication,
} from '@/hooks/api/admin/useApplications';
import { ArrowLeft, Check, X, UserPlus, Loader2 } from 'lucide-react';

export default function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);
  const router = useRouter();

  const { data: applications, isLoading } = useAdminApplications();
  const updateApplication = useAdminUpdateApplication();
  const convertApplication = useAdminConvertApplication();

  const application = applications?.find((app: any) => app.id === applicationId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-admin-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Application not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (status: string) => {
    try {
      await updateApplication.mutateAsync({ id: applicationId, data: { status } });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update status');
    }
  };

  const handleConvert = async () => {
    try {
      await convertApplication.mutateAsync(applicationId);
      router.push('/admin/admissions/applications');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to convert applicant to student');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Details</h1>
          <p className="text-muted-foreground mt-1">Review application and update status</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">First Name</label>
                  <p className="font-medium">{application.firstName}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Last Name</label>
                  <p className="font-medium">{application.lastName}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Email</label>
                  <p className="font-medium">{application.email}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Phone</label>
                  <p className="font-medium">{application.phone || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Program</label>
                  <p className="font-medium">{application.program?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Academic Year</label>
                  <p className="font-medium">{application.academicYear?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-medium">Submitted At</label>
                  <p className="font-medium">
                    {application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Current Status
                </label>
                <Badge variant="outline" className="bg-amber-50 px-3 py-1 text-sm">
                  {application.status}
                </Badge>
              </div>

              <div className="space-y-2 border-t pt-4">
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Update Status
                </label>

                {application.status === 'SUBMITTED' && (
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleStatusChange('UNDER_REVIEW')}
                    disabled={updateApplication.isPending}
                  >
                    {updateApplication.isPending &&
                    updateApplication.variables?.data?.status === 'UNDER_REVIEW' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}{' '}
                    Start Review
                  </Button>
                )}

                {application.status === 'UNDER_REVIEW' && (
                  <>
                    <Button
                      className="w-full justify-start border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      variant="outline"
                      onClick={() => handleStatusChange('OFFERED')}
                      disabled={updateApplication.isPending}
                    >
                      {updateApplication.isPending &&
                      updateApplication.variables?.data?.status === 'OFFERED' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}{' '}
                      Issue Offer
                    </Button>
                    <Button
                      className="text-destructive hover:bg-destructive/10 border-destructive/20 w-full justify-start"
                      variant="outline"
                      onClick={() => handleStatusChange('REJECTED')}
                      disabled={updateApplication.isPending}
                    >
                      {updateApplication.isPending &&
                      updateApplication.variables?.data?.status === 'REJECTED' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}{' '}
                      Reject
                    </Button>
                  </>
                )}

                {application.status === 'OFFERED' && (
                  <Button
                    className="w-full justify-start border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    variant="outline"
                    onClick={() => handleStatusChange('ACCEPTED')}
                    disabled={updateApplication.isPending}
                  >
                    {updateApplication.isPending &&
                    updateApplication.variables?.data?.status === 'ACCEPTED' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}{' '}
                    Mark as Accepted
                  </Button>
                )}

                {application.status === 'ACCEPTED' && (
                  <Button
                    className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground w-full"
                    onClick={handleConvert}
                    disabled={convertApplication.isPending}
                  >
                    {convertApplication.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Convert to Student
                  </Button>
                )}

                {application.status === 'ENROLLED' && (
                  <div className="rounded-md bg-emerald-50 p-3 text-sm font-medium text-emerald-600">
                    This applicant has been successfully enrolled as a student.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
