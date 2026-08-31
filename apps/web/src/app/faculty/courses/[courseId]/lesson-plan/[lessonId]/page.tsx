'use client';

import React, { use, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@student-erp/ui';
import { useLessonPlan, useCompleteLessonPlan } from '@student-erp/hooks';
import { Loader2, ArrowLeft, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function LessonPlanDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();

  const { data: plan, isLoading, error } = useLessonPlan(courseId, lessonId);
  const completeMutation = useCompleteLessonPlan(courseId);

  const [completeForm, setCompleteForm] = useState({
    actualCompletionDate: new Date().toISOString().split('T')[0],
    reflectionNotes: '',
  });

  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !plan) {
    return <div className="text-destructive p-12 text-center">Failed to load lesson plan</div>;
  }

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync({
        id: lessonId,
        data: completeForm,
      });
      setIsCompleteOpen(false);
    } catch (e: any) {
      alert('Failed to complete lesson plan');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{plan.title}</h1>
            <p className="text-muted-foreground">Sequence: {plan.sequence}</p>
          </div>
          <Badge className={getStatusColor(plan.status)}>{plan.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{plan.description || 'No description provided.'}</p>
            </CardContent>
          </Card>

          {plan.reflectionNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Reflection Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic">{plan.reflectionNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Planned Date:</span>
                <span>{format(new Date(plan.plannedDate), 'MMM dd, yyyy')}</span>
              </div>
              {plan.actualCompletionDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Completed On:</span>
                  <span>{format(new Date(plan.actualCompletionDate), 'MMM dd, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <BookOpen className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Method:</span>
                <span className="capitalize">{plan.teachingMethod.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Duration:</span>
                <span>{plan.durationMinutes} minutes</span>
              </div>
            </CardContent>
          </Card>

          {plan.status !== 'COMPLETED' && (
            <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Complete Lesson Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Actual Completion Date</label>
                    <Input
                      type="date"
                      value={completeForm.actualCompletionDate}
                      onChange={(e: any) =>
                        setCompleteForm({ ...completeForm, actualCompletionDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reflection Notes (Optional)</label>
                    <Textarea
                      placeholder="What went well? What needs revision?"
                      rows={4}
                      value={completeForm.reflectionNotes}
                      onChange={(e) =>
                        setCompleteForm({ ...completeForm, reflectionNotes: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleComplete}
                    disabled={completeMutation.isPending}
                  >
                    {completeMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm Completion
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
