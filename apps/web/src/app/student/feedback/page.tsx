'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Badge } from '@student-erp/ui';
import { MessageSquare, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { useStudentFeedback } from '@student-erp/hooks';

export default function FeedbackPage() {
  const { data: feedbackData, isPending: isFeedbackPending } = useStudentFeedback();

  const [submittedForms, setSubmittedForms] = React.useState<string[]>([]);

  const pendingFeedback = (feedbackData?.forms || []).filter(
    (form: any) => !submittedForms.includes(form.id),
  );

  const handleFillFeedback = (formId: string) => {
    // Simulate feedback submission
    setSubmittedForms((prev) => [...prev, formId]);
  };

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Feedback & Support</h1>
        <p className="text-muted-foreground mt-1">Submit course feedback.</p>
      </div>

      <div className="mt-6 space-y-6">
        {isFeedbackPending ? (
          <div className="text-muted-foreground mt-10 text-center">Loading...</div>
        ) : pendingFeedback.length === 0 ? (
          <div className="text-muted-foreground mt-10 text-center">No active feedback forms.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingFeedback.map((form: any) => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="text-base">{form.title}</CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleFillFeedback(form.id)}>
                    Fill Feedback
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
