'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@student-erp/ui';
import { useFacultyAssignmentSubmissions, useGradeFacultySubmission } from '@student-erp/hooks';
import { Loader2, ArrowLeft, Save, Download } from 'lucide-react';

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

  const handleSaveAll = async () => {
    try {
      const submissionsToGrade = submissions.filter((sub: any) => grades[sub.id]);
      await Promise.all(
        submissionsToGrade.map((sub: any) =>
          gradeSubmission.mutateAsync({ submissionId: sub.id, data: grades[sub.id] })
        )
      );
      alert('All grades saved successfully!');
    } catch (e) {
      alert('Failed to save some grades.');
    }
  };

  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) return;

    const headers = ['Student ID', 'Student Name', 'Status', 'Marks', 'Feedback', 'Submitted At'];
    
    const rows = submissions.map((sub: any) => {
      const studentName = sub.student?.user ? `${sub.student.user.firstName} ${sub.student.user.lastName}` : 'Unknown';
      return [
        sub.studentId,
        studentName,
        sub.status,
        sub.marks || '',
        sub.feedback || '',
        sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `assignment_${assignmentId}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={!submissions || submissions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleSaveAll} disabled={gradeSubmission.isPending || Object.keys(grades).length === 0}>
            <Save className="mr-2 h-4 w-4" />
            Save All Grades
          </Button>
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
