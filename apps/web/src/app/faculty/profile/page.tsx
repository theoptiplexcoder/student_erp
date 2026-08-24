'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label,
  Button,
} from '@student-erp/ui';
import { useFacultyProfile } from '@student-erp/hooks';
import { Loader2, User, Building, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function FacultyProfilePage() {
  const { data: profile, isLoading, error } = useFacultyProfile();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal and academic information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="h-fit md:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <div className="bg-primary/10 mb-4 flex h-24 w-24 items-center justify-center rounded-full">
              <User className="text-primary h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold">
              {profile.user.firstName} {profile.user.lastName}
            </h2>
            <p className="text-muted-foreground">{profile.teacherCode}</p>
            <Badge className="mt-2">{profile.status}</Badge>

            <div className="mt-6 w-full space-y-4 text-left text-sm">
              <div className="flex items-center gap-3">
                <Building className="text-muted-foreground h-4 w-4" />
                <span>{profile.department.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span>{profile.user.email}</span>
              </div>
              {profile.user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span>{profile.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span>Joined {format(new Date(profile.hireDate), 'MMM yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Core Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={profile.user.firstName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={profile.user.lastName} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={profile.user.phone || ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Input value={profile.employmentType} disabled />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input value={profile.institution.name} disabled />
              </div>
            </div>

            <div className="pt-4">
              <p className="text-muted-foreground text-sm">
                To update core employment fields, please contact your institution administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
