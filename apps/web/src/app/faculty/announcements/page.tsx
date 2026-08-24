'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@student-erp/ui';
import { useFacultyAnnouncements } from '@student-erp/hooks';
import { Loader2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';

export default function FacultyAnnouncementsPage() {
  const { data: announcements, isLoading, error } = useFacultyAnnouncements();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !announcements) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Institute and course announcements</p>
        </div>
      </div>

      <div className="grid gap-6">
        {announcements.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed py-12 text-center">
            No announcements available.
          </div>
        ) : (
          announcements.map((ann: any) => (
            <Card key={ann.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Megaphone className="text-primary h-5 w-5" />
                    {ann.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(ann.publishedAt), 'MMMM dd, yyyy')}
                    {ann.course && ` • ${ann.course.code}`}
                  </p>
                </div>
                <Badge variant={ann.courseId ? 'secondary' : 'default'}>
                  {ann.courseId ? 'Course' : 'Institution'}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
