'use client';

import React, { use, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Badge,
} from '@student-erp/ui';
import { useCreateLessonPlan, useFacultyCourseDetails } from '@student-erp/hooks';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewLessonPlanPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();

  const { data: assignment, isLoading } = useFacultyCourseDetails(courseId);
  const createMutation = useCreateLessonPlan(courseId);

  const [form, setForm] = useState({
    title: '',
    description: '',
    plannedDate: '',
    durationMinutes: 60,
    teachingMethod: 'LECTURE',
    status: 'DRAFT',
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'SCHEDULED') => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...form,
        termId: assignment.termId,
        status,
        durationMinutes: Number(form.durationMinutes),
      });
      router.push(`/faculty/courses/${courseId}/lesson-plan`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create lesson plan');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Lesson Plan</h1>
          <p className="text-muted-foreground">{assignment?.course.name}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Lesson Title</label>
                <Input
                  required
                  placeholder="e.g. Introduction to SQL Joins"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Planned Date</label>
                <Input
                  type="date"
                  required
                  value={form.plannedDate}
                  onChange={(e) => setForm({ ...form, plannedDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm({ ...form, durationMinutes: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teaching Method</label>
                <select
                  className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                  value={form.teachingMethod}
                  onChange={(e) => setForm({ ...form, teachingMethod: e.target.value })}
                >
                  <option value="LECTURE">Lecture</option>
                  <option value="TUTORIAL">Tutorial</option>
                  <option value="PRACTICAL">Practical</option>
                  <option value="DISCUSSION">Discussion</option>
                  <option value="DEMONSTRATION">Demonstration</option>
                  <option value="ASSESSMENT">Assessment</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Brief overview of what this lesson covers..."
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, 'DRAFT')}
                disabled={createMutation.isPending}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'SCHEDULED')}
                disabled={createMutation.isPending || !form.title || !form.plannedDate}
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Schedule Lesson
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
