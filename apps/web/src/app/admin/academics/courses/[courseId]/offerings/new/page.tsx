'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from '@student-erp/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewCourseOfferingPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Submit logic will go here
    setTimeout(() => {
      setLoading(false);
      router.push(`/admin/courses/${params.courseId}`);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Course Offering</h1>
        <p className="text-muted-foreground">
          Assign this course to an academic term, program, and section.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Offering Details</CardTitle>
          <CardDescription>Specify where and when this course will be taught.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input id="academicYear" required placeholder="e.g. 2026-27" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term / Semester</Label>
                <Input id="term" required placeholder="e.g. Semester 3" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Input id="program" required placeholder="e.g. B.Tech Computer Science" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input id="batch" required placeholder="e.g. Batch 2025" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input id="section" required placeholder="e.g. Section A" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Max Students)</Label>
              <Input id="capacity" type="number" required placeholder="e.g. 60" />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Offering'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
