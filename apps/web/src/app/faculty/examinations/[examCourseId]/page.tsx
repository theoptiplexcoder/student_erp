'use client';

import React, { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@student-erp/ui';
import { useFacultyExamMarks, useSaveExamMarks } from '@student-erp/hooks';
import { Loader2, ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MarksEntryPage({ params }: { params: Promise<{ examCourseId: string }> }) {
  const { examCourseId } = use(params);
  const router = useRouter();

  const { data, isLoading, error } = useFacultyExamMarks(examCourseId);
  const saveMarks = useSaveExamMarks(examCourseId);

  const [marksState, setMarksState] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data?.marks) {
      const initial: Record<string, any> = {};
      data.marks.forEach((m: any) => {
        initial[m.enrollmentId] = m;
      });
      setMarksState(initial);
    }
  }, [data]);

  const handleMarkChange = (enrollmentId: string, studentId: string, field: string, value: any) => {
    setMarksState((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        enrollmentId,
        studentId,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const marksArray = Object.values(marksState);
    if (marksArray.length === 0) return;

    try {
      await saveMarks.mutateAsync({ marks: marksArray });
      alert('Marks saved successfully');
    } catch (e) {
      alert('Failed to save marks');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load examination details.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const { examCourse, enrollments } = data;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marks Entry</h1>
            <p className="text-muted-foreground">
              {examCourse.course.code} - {examCourse.course.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saveMarks.isPending}>
          {saveMarks.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Marks
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{examCourse.exam.name}</Badge>
            <span className="text-muted-foreground text-sm">
              Max Marks: {examCourse.maxMarks || '-'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">Student Name</th>
                  <th className="p-3 font-medium">ID / Roll No</th>
                  <th className="w-32 p-3 font-medium">Marks Obtained</th>
                  <th className="w-32 p-3 font-medium">Grade</th>
                  <th className="w-48 p-3 font-medium">Result Status</th>
                  <th className="p-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground p-6 text-center">
                      No active enrollments found.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e: any) => (
                    <tr key={e.id}>
                      <td className="p-3 font-medium">
                        {e.student.user.firstName} {e.student.user.lastName}
                      </td>
                      <td className="p-3">{e.student.rollNumber || e.student.admissionNumber}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          placeholder="e.g. 85"
                          className="h-8"
                          value={marksState[e.id]?.marksObtained || ''}
                          onChange={(ev) =>
                            handleMarkChange(
                              e.id,
                              e.studentId,
                              'marksObtained',
                              parseFloat(ev.target.value),
                            )
                          }
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="e.g. A"
                          className="h-8"
                          value={marksState[e.id]?.grade || ''}
                          onChange={(ev) =>
                            handleMarkChange(e.id, e.studentId, 'grade', ev.target.value)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <select
                          className="bg-background flex h-8 w-full rounded-md border px-3 text-sm shadow-sm"
                          value={marksState[e.id]?.resultStatus || 'PASS'}
                          onChange={(ev) =>
                            handleMarkChange(e.id, e.studentId, 'resultStatus', ev.target.value)
                          }
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="MALPRACTICE">MALPRACTICE</option>
                          <option value="WITHHELD">WITHHELD</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="Optional remarks"
                          className="h-8"
                          value={marksState[e.id]?.remarks || ''}
                          onChange={(ev) =>
                            handleMarkChange(e.id, e.studentId, 'remarks', ev.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
