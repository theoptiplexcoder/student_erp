'use client';

import React, { useState, useRef } from 'react';
import { useStudentProfile, useUpdateStudentProfile } from '@student-erp/hooks';
import { createBrowserClient } from '@supabase/ssr';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@student-erp/ui';
import { Badge } from '@student-erp/ui';
import { Edit2, MapPin, Mail, Phone } from 'lucide-react';

export function ProfileBanner() {
  const { data: student, isPending, isError } = useStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    try {
      setIsUploading(true);
      const ext = file.name.split('.').pop();
      const photoName = `${student.id}/profile_${Date.now()}.${ext}`;

      const { data: uploadData, error } = await supabase.storage
        .from('student_profile_bucket')
        .upload(photoName, file);

      if (error) {
        console.error('Upload failed', error);
        alert('Failed to upload photo');
        return;
      }

      if (uploadData) {
        const photoUrl = supabase.storage.from('student_profile_bucket').getPublicUrl(photoName)
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

  if (isPending) {
    return (
      <Card className="overflow-hidden border-none shadow-md">
        <div className="from-primary/20 via-primary/40 to-primary/20 h-32 bg-gradient-to-r md:h-48"></div>
        <CardContent className="relative px-6 pt-0 pb-6 sm:px-10">
          <div className="-mt-16 mb-6 flex flex-col items-center gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:gap-8">
            <Skeleton className="border-background h-32 w-32 rounded-full border-4 shadow-lg" />
            <div className="mb-2 flex-1 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !student) return null;

  const firstName = student.user?.firstName || '';
  const lastName = student.user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const program = student.program?.name || 'Program not set';
  const department = student.program?.department?.name || '';

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="from-primary/20 via-primary/40 to-primary/20 h-32 bg-gradient-to-r md:h-48"></div>
      <CardContent className="relative px-6 pt-0 pb-6 sm:px-10">
        <div className="-mt-16 mb-6 flex flex-col items-center gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:gap-8">
          <div className="relative">
            <Avatar className="border-background bg-background h-32 w-32 border-4 shadow-lg">
              {student.user?.photoUrl ? (
                <AvatarImage src={student.user.photoUrl} alt={fullName} />
              ) : null}
              <AvatarFallback className="text-4xl">{firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-0 bottom-0 h-8 w-8 rounded-full shadow-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="mb-2 flex-1 text-center sm:text-left">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="font-display text-3xl font-bold">{fullName}</h1>
              <Badge variant="secondary" className="mx-auto w-fit sm:mx-0">
                {student.studentCode}
              </Badge>
              <Badge variant="default" className="mx-auto w-fit uppercase sm:mx-0">
                {student.lifecycleStatus}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium">
              {program} {department ? `• ${department}` : ''}
            </p>
          </div>

          <div className="mb-2">
            {/* Kept Edit Profile button, maybe for a general edit mode or removed, let's keep it but make it inert or remove if unused, wait, the prompt says "Each editable section should have a pencil/edit icon." This top one isn't needed anymore, I will remove it */}
          </div>
        </div>

        <div className="border-border grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-3">
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{student.user?.email || 'No email provided'}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{student.user?.phone || 'No phone provided'}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{student.address || 'No address provided'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
