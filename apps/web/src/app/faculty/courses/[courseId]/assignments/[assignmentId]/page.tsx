'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@student-erp/ui';
import { useFacultyAssignmentSubmissions, useGradeFacultySubmission } from '@student-erp/hooks';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

export default function AssignmentSubmissionsPage({
  params,
}: {
  params: Promise<{ courseId: string; assignmentId: string }>;
}) {
  const { courseId, assignmentId } = use(params);
  const router = useRouter();

  const { data: submissions, isLoading } = useFacultyAssignmentSubmissions(courseId, assignmentId);
  const gradeSubmission = useGradeFacultySubmission(courseId, assignmentId);

  const [grades, setGrades] = useState<Record<string, { marks: number; feedback: string }>>({});

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignment Submissions</h1>
          <p className="text-muted-foreground mt-1">Review and grade student submissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {!submissions || submissions.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center">No submissions received yet.</p>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">Student</th>
                    <th className="p-3 font-medium">Date Submitted</th>
                    <th className="p-3 font-medium">Submission Link</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="w-32 p-3 font-medium">Marks</th>
                    <th className="p-3 font-medium">Feedback</th>
                    <th className="p-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {submissions.map((sub: any) => {
                    const gradeState = grades[sub.id] || {
                      marks: sub.marks || 0,
                      feedback: sub.feedback || '',
                    };
                    const isGrading =
                      gradeSubmission.variables?.submissionId === sub.id &&
                      gradeSubmission.isPending;

                    return (
                      <tr key={sub.id} className="hover:bg-muted/30">
                        <td className="p-3 font-medium">
                          {sub.student.user.firstName} {sub.student.user.lastName}
                        </td>
                        <td className="p-3">{new Date(sub.submittedAt).toLocaleString()}</td>
                        <td className="p-3">
                          {sub.submissionUrl ? (
                            <a
                              href={sub.submissionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Work
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={sub.status === 'GRADED' ? 'default' : 'outline'}>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            className="h-8"
                            value={gradeState.marks}
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [sub.id]: { ...gradeState, marks: Number(e.target.value) },
                              }))
                            }
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="text"
                            className="h-8"
                            placeholder="Add feedback..."
                            value={gradeState.feedback}
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [sub.id]: { ...gradeState, feedback: e.target.value },
                              }))
                            }
                          />
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            disabled={isGrading}
                            onClick={() =>
                              gradeSubmission.mutate({ submissionId: sub.id, data: gradeState })
                            }
                          >
                            {isGrading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
