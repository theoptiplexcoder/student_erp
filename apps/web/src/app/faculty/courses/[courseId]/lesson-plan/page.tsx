'use client';

import React, { use } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@student-erp/ui';
import { useLessonPlans, useFacultyCourseDetails } from '@student-erp/hooks';
import { Loader2, ArrowLeft, Plus, Calendar, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function LessonPlanDashboardPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();

  const { data: assignment, isLoading: loadingCourse } = useFacultyCourseDetails(courseId);
  const { data: lessonPlans, isLoading: loadingPlans } = useLessonPlans(
    courseId,
    assignment?.termId,
  );

  if (loadingCourse || loadingPlans) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const completedCount = lessonPlans?.filter((p: any) => p.status === 'COMPLETED').length || 0;
  const totalCount = lessonPlans?.length || 0;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lesson Plans</h1>
            <p className="text-muted-foreground">{assignment?.course.name}</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/faculty/courses/${courseId}/lesson-plan/new`}>
            <Plus className="mr-2 h-4 w-4" /> Create Lesson Plan
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground flex justify-between text-sm font-medium">
              <span>Course Progress</span>
              <span>{progressPercent}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-secondary mt-2 h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Plan Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {totalCount === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <Calendar className="text-muted/50 mx-auto mb-4 h-12 w-12" />
              <p>No lesson plans created yet.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href={`/faculty/courses/${courseId}/lesson-plan/new`}>
                  Create First Lesson
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground bg-muted/50 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Sequence</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Planned Date</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessonPlans?.map((plan: any) => (
                    <tr key={plan.id} className="hover:bg-muted/30 border-b">
                      <td className="px-4 py-3 font-medium">{plan.sequence}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{plan.title}</div>
                        {plan.durationMinutes && (
                          <div className="text-muted-foreground text-xs">
                            {plan.durationMinutes} mins
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {format(new Date(plan.plannedDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3">{plan.teachingMethod}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getStatusColor(plan.status)}>
                          {plan.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/faculty/courses/${courseId}/lesson-plan/${plan.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
