'use client';

import React, { use, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '@student-erp/ui';
import {
  useFacultyAttendanceSummary,
  useFacultySectionDetail,
  useCreateAttendanceSession,
} from '@student-erp/hooks';
import { SectionDetailHeader } from '@/components/faculty/sections/section-detail-header';
import { Loader2, Plus, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function SectionAttendancePage({
  params,
}: {
  params: Promise<{ sectionId: string; courseId: string }>;
}) {
  const { sectionId, courseId } = use(params);

  const { data: detail, isLoading: loadingDetail } = useFacultySectionDetail(sectionId, courseId);
  const { data: summary, isLoading: loadingSummary } = useFacultyAttendanceSummary(
    sectionId,
    courseId,
  );
  const createSessionMutation = useCreateAttendanceSession(sectionId, courseId);

  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    topic: '',
    records: [] as any[],
  });

  if (loadingDetail || loadingSummary) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleOpenNewSession = () => {
    setSessionForm({
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      topic: '',
      records: summary.students.map((s: any) => ({
        studentId: s.id,
        name: s.name,
        rollNumber: s.rollNumber,
        status: 'PRESENT',
        remarks: '',
      })),
    });
    setIsNewSessionOpen(true);
  };

  const handleSaveSession = async () => {
    try {
      await createSessionMutation.mutateAsync(sessionForm);
      setIsNewSessionOpen(false);
    } catch (err: any) {
      alert('Failed to save attendance session');
    }
  };

  const updateRecord = (studentId: string, status: string) => {
    setSessionForm((prev) => ({
      ...prev,
      records: prev.records.map((r) => (r.studentId === studentId ? { ...r, status } : r)),
    }));
  };

  const markAll = (status: string) => {
    setSessionForm((prev) => ({
      ...prev,
      records: prev.records.map((r) => ({ ...r, status })),
    }));
  };

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
          <h2 className="text-xl font-semibold">Attendance History</h2>
          <p className="text-muted-foreground text-sm">
            Avg Attendance: {summary?.summary.avgAttendance.toFixed(1)}% over{' '}
            {summary?.summary.totalSessions} sessions
          </p>
        </div>

        {!isNewSessionOpen && (
          <Button onClick={handleOpenNewSession}>
            <Plus className="mr-2 h-4 w-4" /> New Session
          </Button>
        )}
      </div>

      {isNewSessionOpen && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mark Attendance</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsNewSessionOpen(false)}>
              Cancel
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-4 border-b pb-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Date</label>
                <Input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Start Time</label>
                <Input
                  type="time"
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">End Time</label>
                <Input
                  type="time"
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium">Topic (Optional)</label>
                <Input
                  placeholder="e.g. Intro to SQL"
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">Students ({sessionForm.records.length})</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')}>
                  All Present
                </Button>
                <Button variant="outline" size="sm" onClick={() => markAll('ABSENT')}>
                  All Absent
                </Button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 sticky top-0 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionForm.records.map((r) => (
                    <tr key={r.studentId} className="border-b">
                      <td className="px-4 py-2">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-muted-foreground text-xs">{r.rollNumber}</div>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          className={`rounded border px-2 py-1 text-sm font-medium ${r.status === 'PRESENT' ? 'border-green-200 bg-green-50 text-green-700' : r.status === 'ABSENT' ? 'border-red-200 bg-red-50 text-red-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}
                          value={r.status}
                          onChange={(e) => updateRecord(r.studentId, e.target.value)}
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                          <option value="EXCUSED">Excused</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button onClick={handleSaveSession} disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.sessions.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No sessions recorded.
              </p>
            ) : (
              <div className="space-y-4">
                {summary?.sessions.map((s: any) => (
                  <div
                    key={s.id}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <div className="font-medium">{format(new Date(s.date), 'MMM dd, yyyy')}</div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />{' '}
                        {String(s.startTime).substring(0, 5)}
                        {s.topic && ` • ${s.topic}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {s.presentCount} P
                      </Badge>
                      <Badge variant="outline" className="ml-1 bg-red-50 text-red-700">
                        {s.absentCount} A
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Present</th>
                    <th className="px-4 py-3">Absent</th>
                    <th className="px-4 py-3">%</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.students.map((s: any) => (
                    <tr key={s.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-muted-foreground text-xs">{s.rollNumber}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-green-600">
                        {s.present + s.excused}
                      </td>
                      <td className="px-4 py-3 font-medium text-red-600">{s.absent}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={getRateColor(s.attendancePercentage)}>
                          {s.attendancePercentage.toFixed(0)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
