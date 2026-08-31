'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@student-erp/ui';
import { useFacultyCourses } from '@student-erp/hooks';
import { Loader2, Users, Search, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default function FacultyCoursesPage() {
  const { data: assignments, isLoading, error } = useFacultyCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !assignments) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load courses.</p>
      </div>
    );
  }

  // Filter based on search (assuming simple active status for now since backend doesn't have status yet)
  const filteredAssignments = assignments.filter((a: any) => {
    const searchMatch =
      a.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.course.code.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">Courses and sections assigned to you</p>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssignments.map((assignment: any) => {
          return (
            <Card
              key={assignment.id}
              className="hover:border-primary/50 flex flex-col transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="line-clamp-2 leading-tight">
                    {assignment.course.name}
                  </CardTitle>
                  <Badge variant="outline">{assignment.section.name}</Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{assignment.course.code}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="w-4">🎓</span>
                    <span>{assignment.course.program?.name || 'B.Tech'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-4">📅</span>
                    <span className="text-muted-foreground">
                      {assignment.term?.name || 'Current Term'}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{assignment.totalStudents || 0} students</span>
                  </p>
                </div>

                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">
                      {assignment.lessonPlansCompleted || 0}/{assignment.lessonPlansTotal || 0}{' '}
                      Lessons
                    </span>
                  </div>
                  <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{
                        width: `${assignment.lessonPlansTotal ? Math.round((assignment.lessonPlansCompleted / assignment.lessonPlansTotal) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {assignment.nextClass && (
                  <div className="text-muted-foreground bg-muted flex items-center gap-2 rounded-md p-2 text-xs">
                    <Clock className="text-primary h-3.5 w-3.5" />
                    <span>
                      Next class: Today,{' '}
                      {new Date(`1970-01-01T${assignment.nextClass.startTime}`).toLocaleTimeString(
                        [],
                        { hour: '2-digit', minute: '2-digit' },
                      )}
                    </span>
                  </div>
                )}

                <Button asChild className="mt-2 w-full" variant="default">
                  <Link href={`/faculty/courses/${assignment.courseId}`}>
                    View Course <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {filteredAssignments.length === 0 && (
          <div className="text-muted-foreground col-span-full rounded-lg border border-dashed py-12 text-center">
            No courses found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
