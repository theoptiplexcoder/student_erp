'use client';

import React, { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@student-erp/ui';
import { useFacultyExamMarks, useSaveExamMarks } from '@student-erp/hooks';
import { Loader2, ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function calculateGradeAndPercentage(marksObtained: number | undefined, maxMarks: number) {
  if (marksObtained === undefined || isNaN(marksObtained) || marksObtained < 0) {
    return { percentage: undefined, grade: undefined, resultStatus: 'PASS' };
  }

  const validMax = maxMarks > 0 ? maxMarks : 100;
  const pct = Math.round((marksObtained / validMax) * 100 * 10) / 10;

  let grade = 'F';
  let status = 'FAIL';

  if (pct >= 90) {
    grade = 'A+';
    status = 'PASS';
  } else if (pct >= 80) {
    grade = 'A';
    status = 'PASS';
  } else if (pct >= 70) {
    grade = 'B';
    status = 'PASS';
  } else if (pct >= 60) {
    grade = 'C';
    status = 'PASS';
  } else if (pct >= 50) {
    grade = 'D';
    status = 'PASS';
  } else if (pct >= 40) {
    grade = 'E';
    status = 'PASS';
  } else {
    grade = 'F';
    status = 'FAIL';
  }

  return { percentage: pct, grade, resultStatus: status };
}

export default function MarksEntryPage({ params }: { params: Promise<{ examCourseId: string }> }) {
  const { examCourseId } = use(params);
  const router = useRouter();

  const { data, isLoading, error } = useFacultyExamMarks(examCourseId);
  const saveMarks = useSaveExamMarks(examCourseId);

  const [marksState, setMarksState] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.marks) {
      const initial: Record<string, any> = {};
      data.marks.forEach((m: any) => {
        initial[m.enrollmentId] = m;
      });
      setMarksState(initial);
    }
  }, [data]);

  const maxMarks = data?.examCourse?.maxMarks || 100;

  const handleMarksObtainedChange = (enrollmentId: string, studentId: string, valStr: string) => {
    const val = valStr === '' ? undefined : parseFloat(valStr);

    if (val !== undefined && val > maxMarks) {
      setValidationErrors((prev) => ({
        ...prev,
        [enrollmentId]: `Marks cannot exceed total marks (${maxMarks})`,
      }));
    } else {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[enrollmentId];
        return next;
      });
    }

    const { percentage, grade, resultStatus } = calculateGradeAndPercentage(val, maxMarks);

    setMarksState((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        enrollmentId,
        studentId,
        marksObtained: val,
        percentage: percentage !== undefined ? percentage : prev[enrollmentId]?.percentage,
        grade: grade !== undefined ? grade : prev[enrollmentId]?.grade,
        resultStatus: val !== undefined ? resultStatus : prev[enrollmentId]?.resultStatus || 'PASS',
      },
    }));
  };

  const handleFieldChange = (
    enrollmentId: string,
    studentId: string,
    field: string,
    value: any,
  ) => {
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
    if (Object.keys(validationErrors).length > 0) {
      alert('Please correct validation errors before saving.');
      return;
    }

    const marksArray = Object.values(marksState);
    if (marksArray.length === 0) return;

    try {
      await saveMarks.mutateAsync({ marks: marksArray });
      alert('Marks saved successfully');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to save marks');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-destructive">Failed to load examination details.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const { examCourse, enrollments } = data;

  return (
    <div className="space-y-6 p-4 pb-16 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marks Entry</h1>
            <p className="text-muted-foreground text-sm">
              {examCourse.course.code} - {examCourse.course.name}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saveMarks.isPending || Object.keys(validationErrors).length > 0}
        >
          {saveMarks.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Marks
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline">{examCourse.exam.name}</Badge>
              <Badge variant="secondary">{examCourse.exam.examType}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-primary/10 text-primary rounded-md px-3 py-1 font-semibold">
                Total Marks: {maxMarks}
              </div>
              {examCourse.passingMarks && (
                <div className="text-muted-foreground">
                  Passing Marks:{' '}
                  <span className="text-foreground font-medium">{examCourse.passingMarks}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden rounded-md border md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="p-3 font-medium">Student Name</th>
                  <th className="p-3 font-medium">Roll No</th>
                  <th className="w-36 p-3 font-medium">
                    Marks Obtained{' '}
                    <span className="text-muted-foreground text-xs lowercase">(/ {maxMarks})</span>
                  </th>
                  <th className="w-24 p-3 font-medium">Percent (%)</th>
                  <th className="w-24 p-3 font-medium">Grade</th>
                  <th className="w-40 p-3 font-medium">Result Status</th>
                  <th className="p-3 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-muted-foreground p-6 text-center">
                      No active enrollments found for this section.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((e: any) => {
                    const row = marksState[e.id] || {};
                    const err = validationErrors[e.id];

                    return (
                      <tr key={e.id} className="hover:bg-muted/30">
                        <td className="text-foreground p-3 font-medium">
                          {e.student.user.firstName} {e.student.user.lastName}
                        </td>
                        <td className="text-muted-foreground p-3">
                          {e.student.rollNumber || e.student.admissionNumber || '-'}
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            max={maxMarks}
                            placeholder={`0-${maxMarks}`}
                            className={`h-8 ${err ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            value={row.marksObtained !== undefined ? row.marksObtained : ''}
                            onChange={(ev) =>
                              handleMarksObtainedChange(e.id, e.studentId, ev.target.value)
                            }
                          />
                          {err && <p className="text-destructive mt-0.5 text-[10px]">{err}</p>}
                        </td>
                        <td className="p-3 font-medium">
                          {row.percentage !== undefined ? `${row.percentage}%` : '-'}
                        </td>
                        <td className="p-3">
                          <Input
                            placeholder="Grade"
                            className="h-8 w-16 uppercase"
                            value={row.grade || ''}
                            onChange={(ev) =>
                              handleFieldChange(
                                e.id,
                                e.studentId,
                                'grade',
                                ev.target.value.toUpperCase(),
                              )
                            }
                          />
                        </td>
                        <td className="p-3">
                          <select
                            className="bg-background flex h-8 w-full rounded-md border px-2 text-xs shadow-sm"
                            value={row.resultStatus || 'PASS'}
                            onChange={(ev) =>
                              handleFieldChange(e.id, e.studentId, 'resultStatus', ev.target.value)
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
                            placeholder="Remarks"
                            className="h-8 text-xs"
                            value={row.remarks || ''}
                            onChange={(ev) =>
                              handleFieldChange(e.id, e.studentId, 'remarks', ev.target.value)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-4 md:hidden">
            {enrollments.length === 0 ? (
              <p className="text-muted-foreground p-4 text-center text-sm">
                No active enrollments found for this section.
              </p>
            ) : (
              enrollments.map((e: any) => {
                const row = marksState[e.id] || {};
                const err = validationErrors[e.id];

                return (
                  <div key={e.id} className="bg-card space-y-3 rounded-lg border p-4 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-foreground text-sm font-semibold">
                          {e.student.user.firstName} {e.student.user.lastName}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Roll: {e.student.rollNumber || e.student.admissionNumber || '-'}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {row.percentage !== undefined ? `${row.percentage}%` : 'Not entered'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-muted-foreground mb-1 block text-xs">
                          Marks (/ {maxMarks})
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={maxMarks}
                          placeholder="Marks"
                          className={`h-8 ${err ? 'border-destructive' : ''}`}
                          value={row.marksObtained !== undefined ? row.marksObtained : ''}
                          onChange={(ev) =>
                            handleMarksObtainedChange(e.id, e.studentId, ev.target.value)
                          }
                        />
                        {err && <p className="text-destructive mt-0.5 text-[10px]">{err}</p>}
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block text-xs">Grade</label>
                        <Input
                          placeholder="Grade"
                          className="h-8 uppercase"
                          value={row.grade || ''}
                          onChange={(ev) =>
                            handleFieldChange(
                              e.id,
                              e.studentId,
                              'grade',
                              ev.target.value.toUpperCase(),
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-muted-foreground mb-1 block text-xs">Status</label>
                        <select
                          className="bg-background flex h-8 w-full rounded-md border px-2 text-xs shadow-sm"
                          value={row.resultStatus || 'PASS'}
                          onChange={(ev) =>
                            handleFieldChange(e.id, e.studentId, 'resultStatus', ev.target.value)
                          }
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="MALPRACTICE">MALPRACTICE</option>
                          <option value="WITHHELD">WITHHELD</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-muted-foreground mb-1 block text-xs">Remarks</label>
                        <Input
                          placeholder="Remarks"
                          className="h-8 text-xs"
                          value={row.remarks || ''}
                          onChange={(ev) =>
                            handleFieldChange(e.id, e.studentId, 'remarks', ev.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
