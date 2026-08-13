'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminFacultyDetails } from '@/hooks/api/admin/useFaculty';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Badge,
  Separator,
} from '@student-erp/ui';
import { ArrowLeft, User, Building, Briefcase, Mail, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function FacultyDetailsPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const router = useRouter();
  const { facultyId } = use(params);
  const { data: faculty, isLoading, error } = useAdminFacultyDetails(facultyId);

  if (isLoading) {
    return <div className="text-muted-foreground p-6 text-center">Loading faculty details...</div>;
  }

  if (error || !faculty) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-4">Failed to load faculty details.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Faculty</Button>
          <Button variant="destructive">Deactivate</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
              <User className="text-primary h-12 w-12" />
            </div>
            <CardTitle className="text-2xl">
              {faculty.user.firstName} {faculty.user.lastName}
            </CardTitle>
            <p className="text-muted-foreground">{faculty.teacherCode}</p>
            <div className="mt-2">
              <Badge variant={faculty.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {faculty.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="text-muted-foreground mr-2 h-4 w-4" />
                {faculty.user.email}
              </div>
              <div className="flex items-center text-sm">
                <Building className="text-muted-foreground mr-2 h-4 w-4" />
                {faculty.department?.name || 'No Department'}
              </div>
              <div className="flex items-center text-sm">
                <Briefcase className="text-muted-foreground mr-2 h-4 w-4" />
                <span className="capitalize">{faculty.employmentType.toLowerCase()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 border-t pt-6">
            <div>
              <h3 className="mb-4 text-lg font-medium">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs uppercase">First Name</label>
                  <p className="font-medium">{faculty.user.firstName}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs uppercase">Last Name</label>
                  <p className="font-medium">{faculty.user.lastName}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs uppercase">Email Address</label>
                  <p className="font-medium">{faculty.user.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs uppercase">Teacher Code</label>
                  <p className="font-medium">{faculty.teacherCode}</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="mb-4 text-lg font-medium">Employment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs uppercase">Department</label>
                  <p className="font-medium">{faculty.department?.name || 'Unassigned'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs uppercase">Employment Type</label>
                  <p className="font-medium capitalize">{faculty.employmentType.toLowerCase()}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs uppercase">Status</label>
                  <p className="font-medium">{faculty.status}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
