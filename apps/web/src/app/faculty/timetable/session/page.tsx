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
import {
  useFacultySession,
  useEligibleStudents,
  useSaveAttendance,
  useFacultyResources,
  useLessonPlans,
} from '@student-erp/hooks';
import {
  Loader2,
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  User,
  BookOpen,
  FileText,
  ExternalLink,
  GraduationCap,
  Building,
} from 'lucide-react';
import { format } from 'date-fns';

function formatDisplayTime(timeString: string | Date | null | undefined) {
  if (!timeString) return null;
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString);
  return format(date, 'hh:mm a');
}

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
  const { data: resources, isLoading: loadingResources } = useFacultyResources(courseId!);
  const { data: lessonPlans, isLoading: loadingLessonPlans } = useLessonPlans(courseId!);

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
  const departmentName = session?.course?.department?.name || '';
  const credits = session?.course?.creditValue;
  const sectionName = session?.section?.name || '';
  const programName = session?.section?.program?.name || '';
  const roomName = session?.timetableEntry?.room?.number || session?.timetableEntry?.room?.name;
  const roomCapacity = session?.timetableEntry?.room?.capacity;
  const buildingName = session?.timetableEntry?.building?.name;
  const termName = session?.term?.name;
  const startTime = session?.startTime || session?.timetableEntry?.startTime;
  const endTime = session?.endTime || session?.timetableEntry?.endTime;
  const timeSlot =
    startTime && endTime ? `${formatDisplayTime(startTime)} - ${formatDisplayTime(endTime)}` : null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Session Workspace</h1>
              {session?.id ? (
                <Badge
                  variant="default"
                  className="bg-green-600 text-xs text-white hover:bg-green-700"
                >
                  Recorded
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Scheduled
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {format(new Date(dateStr), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
        </div>

        {timeSlot && (
          <div className="bg-muted/60 flex w-fit items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span>{timeSlot}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="h-fit md:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Course
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-base font-semibold">{courseCode}</span>
                {credits && (
                  <Badge variant="outline" className="text-xs">
                    {credits} {credits === 1 ? 'Credit' : 'Credits'}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium">{courseName}</p>
              {departmentName && <p className="text-muted-foreground text-xs">{departmentName}</p>}
            </div>

            <div className="space-y-2 border-t pt-3">
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Section & Program
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-semibold">
                    Section {sectionName}
                  </Badge>
                  {programName && (
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <GraduationCap className="h-3 w-3" />
                      {programName}
                    </span>
                  )}
                </div>
              </div>

              {termName && (
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Academic Term
                  </p>
                  <p className="mt-0.5 text-xs font-medium">{termName}</p>
                </div>
              )}

              {roomName && (
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Location
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium">
                    <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                    <span>Room {roomName}</span>
                    {buildingName && (
                      <span className="text-muted-foreground">({buildingName})</span>
                    )}
                    {roomCapacity && (
                      <span className="text-muted-foreground text-[11px]">
                        (Cap: {roomCapacity})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-3">
              <Label
                htmlFor="session-topic"
                className="text-muted-foreground text-xs font-medium tracking-wider uppercase"
              >
                Session Topic
              </Label>
              <Input
                id="session-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What was / is being taught?"
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
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="attendance">Take Attendance</TabsTrigger>
              <TabsTrigger value="roster">
                Student Roster ({eligibleStudents?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="notes">Notes & Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-4">
              <Card>
                <CardHeader className="flex flex-col justify-between gap-2 pb-2 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle className="text-lg">Mark Attendance</CardTitle>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {eligibleStudents?.length || 0} students eligible
                    </p>
                  </div>
                  {eligibleStudents && eligibleStudents.length > 0 && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleMarkAll('PRESENT')}>
                        Mark All Present
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {!eligibleStudents || eligibleStudents.length === 0 ? (
                    <div className="text-muted-foreground p-6 text-center">
                      <Users className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8" />
                      <p className="font-medium">No students enrolled in this section.</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Active enrollments for this course and section will show up here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {eligibleStudents.map((student: any) => (
                        <div
                          key={student.id}
                          className="flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                              <User className="text-primary h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {student.user?.firstName} {student.user?.lastName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {student.rollNumber ||
                                  student.admissionNumber ||
                                  student.studentCode ||
                                  'No Roll #'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                            <Button
                              size="sm"
                              variant={attendance[student.id] === 'PRESENT' ? 'default' : 'outline'}
                              onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                              className={
                                attendance[student.id] === 'PRESENT'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
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
                <CardHeader>
                  <CardTitle className="text-lg">Enrolled Students</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {!eligibleStudents || eligibleStudents.length === 0 ? (
                    <div className="text-muted-foreground p-6 text-center">
                      <Users className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8" />
                      <p className="font-medium">No students enrolled in this section.</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Active enrollments for this course and section will show up here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Roll / ID</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                          {eligibleStudents.map((s: any) => (
                            <tr key={s.id} className="hover:bg-muted/30">
                              <td className="px-4 py-3 font-medium">
                                {s.user?.firstName} {s.user?.lastName}
                              </td>
                              <td className="text-muted-foreground px-4 py-3">
                                {s.rollNumber || s.admissionNumber || s.studentCode || '-'}
                              </td>
                              <td className="text-muted-foreground px-4 py-3">
                                {s.user?.email || '-'}
                              </td>
                              <td className="text-muted-foreground px-4 py-3">
                                {s.user?.phone || s.fatherPhone || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="space-y-4">
                {/* Course Resources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4" />
                      Course Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingResources ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="text-primary h-5 w-5 animate-spin" />
                      </div>
                    ) : !resources || resources.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No resources published for this course yet.
                      </p>
                    ) : (
                      <div className="divide-border divide-y">
                        {resources.map((res: any) => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between gap-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{res.title}</p>
                              {res.description && (
                                <p className="text-muted-foreground truncate text-xs">
                                  {res.description}
                                </p>
                              )}
                            </div>
                            {res.fileUrl && (
                              <Button asChild size="sm" variant="ghost">
                                <a href={res.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lesson Plans */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="h-4 w-4" />
                      Lesson Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingLessonPlans ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="text-primary h-5 w-5 animate-spin" />
                      </div>
                    ) : !lessonPlans || lessonPlans.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No lesson plans configured for this course yet.
                      </p>
                    ) : (
                      <div className="divide-border divide-y">
                        {lessonPlans.map((lp: any) => (
                          <div key={lp.id} className="py-2.5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{lp.title}</p>
                              {lp.status && (
                                <Badge variant="outline" className="text-xs">
                                  {lp.status}
                                </Badge>
                              )}
                            </div>
                            {lp.description && (
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {lp.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
