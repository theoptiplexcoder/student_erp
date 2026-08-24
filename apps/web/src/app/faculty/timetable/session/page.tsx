'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Label,
} from '@student-erp/ui';
import { useFacultySession, useEligibleStudents, useSaveAttendance } from '@student-erp/hooks';
import { Loader2, ArrowLeft, Clock, MapPin, Users, CheckCircle, User } from 'lucide-react';
import { format } from 'date-fns';

function SessionWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = searchParams.get('courseId');
  const sectionId = searchParams.get('sectionId');
  const dateStr = searchParams.get('date');

  const { data: session, isLoading: loadingSession } = useFacultySession(
    courseId!,
    sectionId!,
    dateStr!,
  );
  const { data: eligibleStudents, isLoading: loadingStudents } = useEligibleStudents(
    courseId!,
    sectionId!,
  );
  const saveAttendance = useSaveAttendance();

  const [topic, setTopic] = React.useState('');
  const [attendance, setAttendance] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (session?.topic) setTopic(session.topic);
    if (session?.attendanceRecords) {
      const records: Record<string, string> = {};
      session.attendanceRecords.forEach((r: any) => {
        records[r.studentId] = r.status;
      });
      setAttendance(records);
    }
  }, [session]);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    if (!eligibleStudents) return;
    const records: Record<string, string> = {};
    eligibleStudents.forEach((s: any) => {
      records[s.id] = status;
    });
    setAttendance(records);
  };

  const handleSubmit = async () => {
    if (!courseId || !sectionId || !dateStr) return;
    const records = Object.keys(attendance).map((studentId) => ({
      studentId,
      status: attendance[studentId],
    }));

    try {
      await saveAttendance.mutateAsync({
        courseId,
        sectionId,
        date: dateStr,
        topic,
        records,
      });
      alert('Attendance and session details saved successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to save session');
    }
  };

  if (!courseId || !sectionId || !dateStr) {
    return <div className="text-destructive p-6">Missing parameters. Return to Timetable.</div>;
  }

  if (loadingSession || loadingStudents) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const courseCode = session?.course?.code || 'Loading...';
  const courseName = session?.course?.name || '';
  const sectionName = session?.section?.name || '';

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Workspace</h1>
          <p className="text-muted-foreground">
            {format(new Date(dateStr), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="h-fit md:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Course</p>
              <p className="font-semibold">{courseCode}</p>
              <p className="text-sm">{courseName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Section</p>
              <Badge variant="outline">{sectionName}</Badge>
            </div>
            <div>
              <Label>Session Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What is being taught?"
                className="mt-1"
              />
            </div>
            <div className="border-t pt-4">
              <Button className="w-full" onClick={handleSubmit} disabled={saveAttendance.isPending}>
                {saveAttendance.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Finalize Session
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="attendance">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="attendance">Take Attendance</TabsTrigger>
              <TabsTrigger value="roster">Student Roster</TabsTrigger>
              <TabsTrigger value="notes">Notes & Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Mark Attendance</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleMarkAll('PRESENT')}>
                      Mark All Present
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!eligibleStudents || eligibleStudents.length === 0 ? (
                    <p className="text-muted-foreground">No students enrolled in this section.</p>
                  ) : (
                    <div className="space-y-2">
                      {eligibleStudents.map((student: any) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                              <User className="text-primary h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {student.user.firstName} {student.user.lastName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {student.rollNumber || student.admissionNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={attendance[student.id] === 'PRESENT' ? 'default' : 'outline'}
                              onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                              className={
                                attendance[student.id] === 'PRESENT'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : ''
                              }
                            >
                              Present
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                attendance[student.id] === 'ABSENT' ? 'destructive' : 'outline'
                              }
                              onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
                            >
                              Absent
                            </Button>
                            <Button
                              size="sm"
                              variant={attendance[student.id] === 'LATE' ? 'secondary' : 'outline'}
                              onClick={() => handleAttendanceChange(student.id, 'LATE')}
                            >
                              Late
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roster" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-sm">
                    Roster details (emails, phone numbers, bio) would appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-sm">
                    Session notes and resource uploads would appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function SessionWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SessionWorkspaceContent />
    </Suspense>
  );
}
