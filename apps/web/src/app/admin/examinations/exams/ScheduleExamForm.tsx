import { useState, useEffect } from 'react';
import { useCurriculumTerms, useAdminTerms } from '@/hooks/api/admin/useTerms';
import { useAdminCourses } from '@/hooks/api/admin/useCourses';
import { useAdminRooms } from '@/hooks/api/admin/useRooms';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminCurriculumsByProgram } from '@/hooks/api/admin/useCurriculums';
import { useScheduleExam } from '@/hooks/api/admin/useExams';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Label,
} from '@student-erp/ui';
import { Loader2, Plus, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';

const EXAM_TYPES = [
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'MIDTERM', label: 'Midterm' },
  { value: 'FINAL', label: 'Final' },
  { value: 'MAKEUP', label: 'Makeup' },
];

export function ScheduleExamForm({ onCancel }: { onCancel: () => void }) {
  const [programId, setProgramId] = useState<string>('');
  const [curriculumId, setCurriculumId] = useState<string>('');
  const [selectedCurriculumTermId, setSelectedCurriculumTermId] = useState<string>('');
  const [selectedAcademicTermId, setSelectedAcademicTermId] = useState<string>('');
  const [examType, setExamType] = useState<string>('');
  const [examName, setExamName] = useState<string>('');

  const { data: programsData } = useAdminPrograms(1, 100);
  const { data: curriculumsData } = useAdminCurriculumsByProgram(programId);
  const { data: academicTermsData, isLoading: isLoadingAcademicTerms } = useAdminTerms();
  const { data: curriculumTermsData, isLoading: isLoadingTerms } = useCurriculumTerms(
    curriculumId || undefined,
  );
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses(
    1,
    500,
    '',
    '',
    curriculumId,
    selectedCurriculumTermId,
  );
  const { data: roomsData, isLoading: isLoadingRooms } = useAdminRooms(1, 500);

  const scheduleMutation = useScheduleExam();

  const [scheduleData, setScheduleData] = useState<
    Record<
      string,
      {
        date: string;
        startTime: string;
        duration: string;
        roomId: string;
      }
    >
  >({});

  useEffect(() => {
    if (coursesData?.data) {
      const initial: any = {};
      coursesData.data.forEach((c) => {
        if (!scheduleData[c.id]) {
          initial[c.id] = {
            date: '',
            startTime: '09:00',
            duration: '180',
            roomId: 'none',
          };
        } else {
          initial[c.id] = scheduleData[c.id];
        }
      });
      setScheduleData(initial);
    }
  }, [coursesData]);

  const handleFieldChange = (courseId: string, field: string, value: string) => {
    setScheduleData((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedCurriculumTermId || !selectedAcademicTermId || !examType) {
      alert('Please select a curriculum term, academic term, and exam type.');
      return;
    }

    const selectedTerm = academicTermsData?.find((t: any) => t.id === selectedAcademicTermId);
    if (!selectedTerm) return;

    const academicTermId = selectedTerm.id;
    const academicYearId = selectedTerm.academicYearId;

    const coursesToSchedule = [];
    for (const course of coursesData?.data || []) {
      const s = scheduleData[course.id];
      if (s && s.date && s.startTime && s.duration) {
        coursesToSchedule.push({
          courseId: course.id,
          examDate: s.date,
          startTime: s.startTime,
          durationMinutes: parseInt(s.duration, 10),
          roomId: s.roomId !== 'none' ? s.roomId : undefined,
        });
      }
    }

    if (coursesToSchedule.length === 0) {
      alert('Please complete the schedule details for at least one course.');
      return;
    }

    try {
      await scheduleMutation.mutateAsync({
        academicYearId,
        termId: academicTermId,
        examType,
        name: examName || undefined,
        courses: coursesToSchedule,
      });

      alert('Examination schedule saved successfully.');
      onCancel();
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-display text-foreground text-3xl font-bold">
              Schedule Examination
            </h1>
            <p className="text-muted-foreground mt-1">
              Select a curriculum term and configure the exam schedule for courses.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={scheduleMutation.isPending}>
          {scheduleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Schedule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Examination Context</CardTitle>
          <CardDescription>
            Define the basic properties for this examination schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label>
              Program <span className="text-destructive">*</span>
            </Label>
            <select
              className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={programId}
              onChange={(e) => {
                setProgramId(e.target.value);
                setCurriculumId('');
                setSelectedCurriculumTermId('');
              }}
            >
              <option value="">Select a program</option>
              {programsData?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>
              Curriculum <span className="text-destructive">*</span>
            </Label>
            <select
              className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={curriculumId}
              disabled={!programId}
              onChange={(e) => {
                setCurriculumId(e.target.value);
                setSelectedCurriculumTermId('');
              }}
            >
              <option value="">Select a curriculum</option>
              {curriculumsData?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} (v{c.versionNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>
              Curriculum Term <span className="text-destructive">*</span>
            </Label>
            {isLoadingTerms ? (
              <div className="flex h-10 items-center">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            ) : (
              <select
                className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCurriculumTermId}
                disabled={!curriculumId}
                onChange={(e) => setSelectedCurriculumTermId(e.target.value)}
              >
                <option value="">Select a term</option>
                {curriculumTermsData?.map((term: any) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Academic Term <span className="text-destructive">*</span>
            </Label>
            {isLoadingAcademicTerms ? (
              <div className="flex h-10 items-center">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            ) : (
              <select
                className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedAcademicTermId}
                onChange={(e) => setSelectedAcademicTermId(e.target.value)}
              >
                <option value="">Select academic term</option>
                {academicTermsData?.map((term: any) => (
                  <option key={term.id} value={term.id}>
                    {term.name} {term.academicYear?.name ? `(${term.academicYear.name})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Exam Type <span className="text-destructive">*</span>
            </Label>
            <select
              className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
            >
              <option value="">Select type</option>
              {EXAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Custom Name (Optional)</Label>
            <Input
              placeholder="e.g. Midterm Exams 2026"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {selectedCurriculumTermId && (
        <Card>
          <CardHeader>
            <CardTitle>Course Scheduling</CardTitle>
            <CardDescription>
              Set the date, time, duration, and classroom for each course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCourses ? (
              <div className="flex justify-center py-10">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : coursesData?.data?.length === 0 ? (
              <div className="text-muted-foreground py-10 text-center">
                No courses found for this curriculum term.
              </div>
            ) : (
              <div className="border-border overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Course</TableHead>
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead className="w-[120px]">Start Time</TableHead>
                      <TableHead className="w-[120px]">Duration (min)</TableHead>
                      <TableHead className="min-w-[180px]">Classroom</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesData?.data.map((course) => {
                      const s = scheduleData[course.id] || {
                        date: '',
                        startTime: '09:00',
                        duration: '180',
                        roomId: 'none',
                      };
                      return (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">
                            {course.name} <br />
                            <span className="text-muted-foreground text-xs">{course.code}</span>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={s.date}
                              onChange={(e) => handleFieldChange(course.id, 'date', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="time"
                              value={s.startTime}
                              onChange={(e) =>
                                handleFieldChange(course.id, 'startTime', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={s.duration}
                              onChange={(e) =>
                                handleFieldChange(course.id, 'duration', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                              value={s.roomId}
                              onChange={(e) =>
                                handleFieldChange(course.id, 'roomId', e.target.value)
                              }
                            >
                              <option value="none">Not assigned</option>
                              {roomsData?.data.map((room: any) => (
                                <option key={room.id} value={room.id}>
                                  {room.name} {room.capacity ? `(Cap: ${room.capacity})` : ''}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
