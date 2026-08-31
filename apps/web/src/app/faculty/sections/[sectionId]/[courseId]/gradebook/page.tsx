'use client';

import React, { use, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@student-erp/ui';
import {
  useFacultyGradebook,
  useFacultySectionDetail,
  useSaveFacultyMarks,
} from '@student-erp/hooks';
import { SectionDetailHeader } from '@/components/faculty/sections/section-detail-header';
import { Loader2, Save } from 'lucide-react';

export default function SectionGradebookPage({
  params,
}: {
  params: Promise<{ sectionId: string; courseId: string }>;
}) {
  const { sectionId, courseId } = use(params);

  const { data: detail, isLoading: loadingDetail } = useFacultySectionDetail(sectionId, courseId);
  const { data: gradebook, isLoading: loadingGradebook } = useFacultyGradebook(sectionId, courseId);
  const saveMarksMutation = useSaveFacultyMarks(sectionId, courseId);

  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [marksForm, setMarksForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (gradebook?.exams && gradebook.exams.length > 0 && !activeExamId) {
      const firstExam = gradebook.exams[0].id;
      setActiveExamId(firstExam);
    }
  }, [gradebook, activeExamId]);

  useEffect(() => {
    if (activeExamId && gradebook) {
      const formState: Record<string, string> = {};
      gradebook.students.forEach((s: any) => {
        const markObj = s.marks.find((m: any) => m.examCourseId === activeExamId);
        formState[s.id] =
          markObj?.marksObtained !== null && markObj?.marksObtained !== undefined
            ? markObj.marksObtained.toString()
            : '';
      });
      setMarksForm(formState);
    }
  }, [activeExamId, gradebook]);

  if (loadingDetail || loadingGradebook) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const activeExam = gradebook?.exams.find((e: any) => e.id === activeExamId);

  const handleSaveMarks = async () => {
    if (!activeExamId) return;

    const marksData = Object.entries(marksForm)
      .filter(([_, val]) => val.trim() !== '')
      .map(([studentId, val]) => ({
        studentId,
        marksObtained: parseFloat(val),
      }));

    if (marksData.length === 0) return;

    try {
      await saveMarksMutation.mutateAsync({
        examCourseId: activeExamId,
        marks: marksData,
      });
    } catch (e: any) {
      alert('Failed to save marks');
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'PASS') return 'text-green-600 bg-green-50';
    if (status === 'FAIL') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6 p-6">
      <SectionDetailHeader
        course={detail?.course}
        section={detail?.section}
        studentsCount={detail?.studentsCount || 0}
      />

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gradebook</h2>
          <p className="text-muted-foreground text-sm">Enter and manage marks</p>
        </div>

        {activeExam && (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Max Marks:</span>{' '}
              <span className="font-medium">{activeExam.maxMarks}</span>
              <span className="text-muted-foreground mx-2">|</span>
              <span className="text-muted-foreground">Passing:</span>{' '}
              <span className="font-medium">{activeExam.passingMarks}</span>
            </div>
            <Button onClick={handleSaveMarks} disabled={saveMarksMutation.isPending}>
              {saveMarksMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Marks
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto border-b pb-4">
        {gradebook?.exams.length === 0 ? (
          <p className="text-muted-foreground py-2 text-sm">No exams linked to this course.</p>
        ) : (
          gradebook?.exams.map((exam: any) => (
            <Button
              key={exam.id}
              variant={activeExamId === exam.id ? 'default' : 'outline'}
              onClick={() => setActiveExamId(exam.id)}
            >
              {exam.name}
            </Button>
          ))
        )}
      </div>

      {activeExamId && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Roll Number</th>
                    <th className="w-40 px-4 py-3">Marks ({activeExam?.maxMarks})</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gradebook?.students.map((s: any) => {
                    const savedMark = s.marks.find((m: any) => m.examCourseId === activeExamId);

                    return (
                      <tr key={s.id} className="border-b">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="text-muted-foreground px-4 py-3">{s.rollNumber}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            max={activeExam?.maxMarks || 100}
                            value={marksForm[s.id] ?? ''}
                            onChange={(e) =>
                              setMarksForm((prev) => ({ ...prev, [s.id]: e.target.value }))
                            }
                            className="w-24 text-center"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{savedMark?.grade || '-'}</td>
                        <td className="px-4 py-3">
                          {savedMark?.resultStatus ? (
                            <Badge
                              variant="outline"
                              className={getStatusColor(savedMark.resultStatus)}
                            >
                              {savedMark.resultStatus}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
