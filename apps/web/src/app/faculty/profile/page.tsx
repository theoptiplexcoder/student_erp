'use client';

import React, { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Label,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@student-erp/ui';
import { useFacultyProfile, useUpdateFacultyProfile } from '@student-erp/hooks';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, Camera, Building, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function FacultyProfilePage() {
  const { data: profile, isLoading, error } = useFacultyProfile();
  const updateProfile = useUpdateFacultyProfile();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  );

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      setIsUploading(true);
      const ext = file.name.split('.').pop();
      const photoName = `${profile.id}/profile_${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('teacher_profile_bucket')
        .upload(photoName, file);

      if (uploadError) {
        console.error('Upload failed', uploadError);
        alert('Failed to upload photo');
        return;
      }

      if (uploadData) {
        const photoUrl = supabase.storage.from('teacher_profile_bucket').getPublicUrl(photoName)
          .data.publicUrl;

        updateProfile.mutate({ photoUrl });
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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

  const firstName = profile.user.firstName || '';
  const lastName = profile.user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const fallbackPhoto = '/teacher_passport.png';
  const photoSrc = profile.user.photoUrl || fallbackPhoto;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Profile</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your personal and academic information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="h-fit md:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <div className="relative mb-4">
              <Avatar className="border-background bg-muted h-28 w-28 border-4 shadow-md sm:h-32 sm:w-32">
                <AvatarImage
                  src={photoSrc}
                  alt={fullName || 'Faculty profile photo'}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl sm:text-4xl">
                  {firstName.charAt(0) || 'F'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                aria-label="Upload profile photo"
                className="absolute right-0 bottom-0 h-8 w-8 rounded-full shadow-md"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || updateProfile.isPending}
              >
                {isUploading || updateProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
            </div>
            <h2 className="text-lg font-bold sm:text-xl">{fullName}</h2>
            <p className="text-muted-foreground text-sm">{profile.teacherCode}</p>
            <Badge className="mt-2">{profile.status}</Badge>

            <div className="mt-6 w-full space-y-4 text-left text-sm">
              <div className="flex items-center gap-3">
                <Building className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="truncate">{profile.department.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="truncate">{profile.user.email}</span>
              </div>
              {profile.user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span>{profile.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={profile.user.firstName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={profile.user.lastName} disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={profile.user.phone || ''} disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
