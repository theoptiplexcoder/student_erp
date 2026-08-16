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
import { useCreateCourse } from '@/hooks/api/admin/useCourses';

interface NewCourseFormProps {
  institutionId: string;
}

export function NewCourseForm({ institutionId }: NewCourseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createCourseMutation = useCreateCourse();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      creditValue: parseFloat(formData.get('credits') as string),
      description: (formData.get('description') as string) || undefined,
      institutionId,
    };

    try {
      await createCourseMutation.mutateAsync(data);
      router.push('/admin/academics/courses');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create course');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Information</CardTitle>
        <CardDescription>Enter the basic details for the new course.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Course Code</Label>
            <Input id="code" name="code" required placeholder="e.g. CS301" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Database Management Systems" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits">Credits</Label>
            <Input
              id="credits"
              name="credits"
              type="number"
              step="0.5"
              required
              placeholder="e.g. 4.0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional brief description" />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCourseMutation.isPending}>
              {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
