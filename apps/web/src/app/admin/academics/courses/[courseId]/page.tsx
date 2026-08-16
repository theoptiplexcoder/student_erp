'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@student-erp/ui';
import Link from 'next/link';
import { Plus, AlertCircle, Edit, Loader2 } from 'lucide-react';
import { useAdminCourse } from '@/hooks/api/admin/useCourses';

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const { data: course, isLoading, isError } = useAdminCourse(params.courseId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <div className="text-destructive">Course not found or failed to load.</div>
        <Link href="/admin/academics/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground">
            {course.code} • {course.credits || course.creditValue} Credits •{' '}
            {course.program?.name || 'No Program'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/academics/courses/${params.courseId}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit Course
            </Button>
          </Link>
          <Link href={`/admin/academics/courses/${params.courseId}/offerings/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Offering
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Code</span>
              <span>{course.code}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Department</span>
              <span>{course.department?.name || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Status</span>
              <Badge variant={course.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {course.status}
              </Badge>
            </div>
            {course.description && (
              <div className="flex justify-between pt-2">
                <span className="font-semibold">Description</span>
                <span className="text-muted-foreground w-2/3 text-right">{course.description}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Offerings</CardTitle>
            <CardDescription>Instances where this course is currently taught</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {course.courseOfferings && course.courseOfferings.length > 0 ? (
                course.courseOfferings.map((offering: any) => (
                  <div
                    key={offering.id}
                    className="flex items-center justify-between rounded-md border p-4"
                  >
                    <div>
                      <h4 className="font-semibold">{offering.term?.name || 'Unknown Term'}</h4>
                      <p className="text-muted-foreground text-sm">
                        {offering.section ? `Section ${offering.section.name}` : 'No Section'}
                        {offering.enrollments?.length > 0
                          ? ` • ${offering.enrollments.length} Enrolled`
                          : ' • 0 Enrolled'}
                      </p>
                    </div>
                    <Link href={`/admin/academics/courses/offerings/${offering.id}`}>
                      <Button variant="secondary" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground flex items-center space-x-2 py-4">
                  <AlertCircle className="h-4 w-4" />
                  <span>No active offerings for this course.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
