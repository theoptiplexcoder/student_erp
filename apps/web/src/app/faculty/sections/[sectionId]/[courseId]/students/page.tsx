'use client';

import React, { use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@student-erp/ui';
import { useFacultySectionStudents, useFacultySectionDetail } from '@student-erp/hooks';
import { SectionDetailHeader } from '@/components/faculty/sections/section-detail-header';
import { Loader2 } from 'lucide-react';

export default function SectionStudentsPage({
  params,
}: {
  params: Promise<{ sectionId: string; courseId: string }>;
}) {
  const { sectionId, courseId } = use(params);

  const { data: detail, isLoading: loadingDetail } = useFacultySectionDetail(sectionId, courseId);
  const { data: studentsData, isLoading: loadingStudents } = useFacultySectionStudents(
    sectionId,
    courseId,
  );

  if (loadingDetail || loadingStudents) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getRateColor = (rate: number) => {
    if (rate >= 85) return 'text-green-600 bg-green-50';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
          <h2 className="text-xl font-semibold">Student Roster</h2>
          <p className="text-muted-foreground text-sm">
            Combined view of attendance and performance
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Roll Number</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-right">Attendance</th>
                  <th className="px-4 py-3 text-right">Marks Avg</th>
                </tr>
              </thead>
              <tbody>
                {studentsData?.students.map((s: any) => (
                  <tr key={s.id} className="hover:bg-muted/30 border-b">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="text-muted-foreground px-4 py-3">{s.rollNumber}</td>
                    <td className="text-muted-foreground px-4 py-3">
                      <div>{s.email || '-'}</div>
                      <div className="text-xs">{s.phone || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline" className={getRateColor(s.attendancePercentage)}>
                        {s.attendancePercentage.toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {s.percentageMarks ? `${s.percentageMarks.toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
