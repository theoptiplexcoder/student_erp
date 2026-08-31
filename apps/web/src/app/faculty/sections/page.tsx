'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@student-erp/ui';
import { useFacultySections } from '@student-erp/hooks';
import { Loader2, Search, ArrowRight, Clock, Users, CheckCircle, BarChart } from 'lucide-react';
import Link from 'next/link';

export default function FacultySectionsPage() {
  const { data: sections, isLoading, error } = useFacultySections();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !sections) {
    return <div className="text-destructive p-12 text-center">Failed to load sections.</div>;
  }

  const filteredSections = sections.filter(
    (s: any) =>
      s.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.section.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Sections</h1>
        <p className="text-muted-foreground">Manage classes, attendance, and grades by section.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input
          placeholder="Search by course or section..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredSections.map((item: any) => (
          <Card
            key={`${item.courseId}-${item.sectionId}`}
            className="hover:border-primary/50 flex flex-col transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="line-clamp-2 leading-tight">{item.course.name}</CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.course.code} • {item.section.program?.name} • {item.term?.name}
                  </p>
                </div>
                <Badge variant="outline" className="bg-secondary px-3 py-1 text-lg">
                  {item.section.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="text-muted-foreground bg-muted/50 flex items-center gap-6 rounded-md p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="text-primary h-4 w-4" />
                  <span>
                    <span className="text-foreground font-medium">{item.totalStudents}</span>{' '}
                    students
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>
                    <span className="text-foreground font-medium">
                      {item.attendanceRate.toFixed(1)}%
                    </span>{' '}
                    attendance
                  </span>
                </div>
              </div>

              {item.nextClass && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    Next Class:
                    <span className="ml-1 font-medium">
                      {new Date(`1970-01-01T${item.nextClass.startTime}`).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {item.nextClass.room ? ` in ${item.nextClass.room}` : ''}
                    </span>
                  </span>
                </div>
              )}

              <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
                <Button asChild variant="default" className="flex-1">
                  <Link href={`/faculty/sections/${item.sectionId}/${item.courseId}/attendance`}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Attendance
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
                >
                  <Link href={`/faculty/sections/${item.sectionId}/${item.courseId}/gradebook`}>
                    <BarChart className="mr-2 h-4 w-4" /> Gradebook
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/faculty/sections/${item.sectionId}/${item.courseId}/students`}>
                    <Users className="mr-2 h-4 w-4" /> Students
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSections.length === 0 && (
          <div className="text-muted-foreground col-span-full rounded-lg border border-dashed py-12 text-center">
            No sections found.
          </div>
        )}
      </div>
    </div>
  );
}
