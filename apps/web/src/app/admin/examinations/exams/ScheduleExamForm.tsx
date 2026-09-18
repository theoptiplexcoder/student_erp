import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';
import { useAdminCourses } from '@/hooks/api/admin/useCourses';
import { useAdminRooms } from '@/hooks/api/admin/useRooms';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminCurriculumsByProgram } from '@/hooks/api/admin/useCurriculums';
import { useScheduleExam } from '@/hooks/api/admin/useExams';
import { useExaminationTypes } from '@/hooks/api/admin/useExamTypes';
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
import { Loader2, ArrowLeft } from 'lucide-react';

const FALLBACK_EXAM_TYPES = [
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'MIDTERM', label: 'Midterm' },
  { value: 'FINAL', label: 'Final' },
  { value: 'MAKEUP', label: 'Makeup' },
];

export function ScheduleExamForm({ onCancel }: { onCancel: () => void }) {
  const [programId, setProgramId] = useState<string>('');
  const [curriculumId, setCurriculumId] = useState<string>('');
  const [selectedAcademicTermId, setSelectedAcademicTermId] = useState<string>('');
  const [selectedExamTypeId, setSelectedExamTypeId] = useState<string>('');
  const [examType, setExamType] = useState<string>('');
  const [examName, setExamName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');

  const { data: dynamicExamTypes = [], isLoading: isLoadingExamTypes } = useExaminationTypes();
  const { data: programsData, isLoading: isLoadingPrograms } = useAdminPrograms(1, 100);
  const { data: curriculumsData, isLoading: isLoadingCurriculums } =
    useAdminCurriculumsByProgram(programId);
  const { data: academicTermsData, isLoading: isLoadingAcademicTerms } = useAdminTerms();
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses(
    1,
    500,
    '',
    '',
    curriculumId,
    '',
    { enabled: !!programId || !!curriculumId, programId: programId || undefined },
  );
  const { data: roomsData } = useAdminRooms(1, 500);

  const scheduleMutation = useScheduleExam();

  const [scheduleData, setScheduleData] = useState<
    Record<
      string,
      {
        date: string;
        startTime: string;
        duration: string;
        roomId: string;
        maxMarks: string;
        passingMarks: string;
      }
    >
  >({});

  // When dynamic exam type changes, auto-populate default marks
  const handleExamTypeSelect = (selectedVal: string) => {
    const found = dynamicExamTypes.find((t) => t.id === selectedVal || t.name === selectedVal);
    if (found) {
      setSelectedExamTypeId(found.id);
      setExamType(found.name);
      setScheduleData((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((cId) => {
          next[cId] = {
            ...next[cId],
            maxMarks: String(found.totalMarks),
            passingMarks: String(found.passingMarks ?? Math.round(found.totalMarks * 0.4)),
          };
        });
        return next;
      });
    } else {
      setSelectedExamTypeId('');
      setExamType(selectedVal);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    // Auto populate course dates if not yet set
    setScheduleData((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((cId) => {
        if (!next[cId].date) {
          next[cId] = {
            ...next[cId],
            date: val,
          };
        }
      });
      return next;
    });
  };

  useEffect(() => {
    if (coursesData?.data) {
      const selectedType = dynamicExamTypes.find(
        (t) => t.id === selectedExamTypeId || t.name === examType,
      );
      const defaultTotal = selectedType ? String(selectedType.totalMarks) : '100';
      const defaultPass = selectedType
        ? String(selectedType.passingMarks ?? Math.round(selectedType.totalMarks * 0.4))
        : '40';

      setScheduleData((prev) => {
        const next = { ...prev };
        coursesData.data.forEach((c) => {
          if (!next[c.id]) {
            next[c.id] = {
              date: startDate || '',
              startTime: '09:00',
              duration: '180',
              roomId: 'none',
              maxMarks: defaultTotal,
              passingMarks: defaultPass,
            };
          }
        });
        return next;
      });
    }
  }, [coursesData, dynamicExamTypes, selectedExamTypeId, examType, startDate]);

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
    if (!programId) {
      alert('Please select a program.');
      return;
    }

    if (!selectedAcademicTermId) {
      alert('Please select an academic term.');
      return;
    }

    if (!examType) {
      alert('Please select an exam type.');
      return;
    }

    if (!startDate) {
      alert('Please select an exam date.');
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
          maxMarks: s.maxMarks ? parseFloat(s.maxMarks) : undefined,
          passingMarks: s.passingMarks ? parseFloat(s.passingMarks) : undefined,
        });
      }
    }

    try {
      await scheduleMutation.mutateAsync({
        academicYearId,
        termId: academicTermId,
        programId: programId || undefined,
        curriculumId: curriculumId || undefined,
        examinationTypeId: selectedExamTypeId || undefined,
        examType,
        name: examName || undefined,
        startDate,
        endDate: startDate,
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
              Select a program, dates, and configure the exam schedule and scoring for courses.
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
            Define the program, term, dates, and examination type for this schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>
              Program <span className="text-destructive">*</span>
            </Label>
            {isLoadingPrograms ? (
              <div className="flex h-10 items-center">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            ) : programsData?.data && programsData.data.length === 0 ? (
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>No programs found.</p>
                <Link
                  href="/admin/academics"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Create Program →
                </Link>
              </div>
            ) : (
              <select
                className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={programId}
                onChange={(e) => {
                  setProgramId(e.target.value);
                  setCurriculumId('');
                }}
              >
                <option value="">Select a program</option>
                {programsData?.data?.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Curriculum (Optional)</Label>
            {isLoadingCurriculums ? (
              <div className="flex h-10 items-center">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            ) : (
              <select
                className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={curriculumId}
                disabled={!programId}
                onChange={(e) => setCurriculumId(e.target.value)}
              >
                <option value="">All Curriculums</option>
                {curriculumsData?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (v{c.versionNumber})
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
            ) : academicTermsData && academicTermsData.length === 0 ? (
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>No academic terms found.</p>
                <Link
                  href="/admin/administration/institution/academic-year"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Create Academic Year →
                </Link>
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
            {isLoadingExamTypes ? (
              <div className="flex h-10 items-center">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              </div>
            ) : (
              <select
                className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedExamTypeId || examType}
                onChange={(e) => handleExamTypeSelect(e.target.value)}
              >
                <option value="">Select exam type</option>
                {dynamicExamTypes.length > 0 ? (
                  <optgroup label="Institutional Exam Types">
                    {dynamicExamTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Total: {t.totalMarks}m)
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="Standard Types">
                  {FALLBACK_EXAM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            )}
            {dynamicExamTypes.length === 0 && (
              <Link
                href="/admin/examinations/grading"
                className="text-primary block text-xs underline-offset-4 hover:underline"
              >
                Create custom exam types →
              </Link>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Exam Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-2 sm:col-span-2 md:col-span-1 lg:col-span-2">
            <Label>Custom Name (Optional)</Label>
            <Input
              placeholder="e.g. Midterm Exams 2026"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {programId && (
        <Card>
          <CardHeader>
            <CardTitle>Course Scheduling & Scoring</CardTitle>
            <CardDescription>
              Configure the date, time, duration, classroom, and total/passing marks for courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCourses ? (
              <div className="flex justify-center py-10">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : coursesData?.data?.length === 0 ? (
              <div className="text-muted-foreground py-10 text-center">
                No courses found for this program.
              </div>
            ) : (
              <div className="border-border overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Course</TableHead>
                      <TableHead className="w-[140px]">Date</TableHead>
                      <TableHead className="w-[110px]">Start Time</TableHead>
                      <TableHead className="w-[100px]">Duration (m)</TableHead>
                      <TableHead className="w-[100px]">Total Marks</TableHead>
                      <TableHead className="w-[100px]">Pass Marks</TableHead>
                      <TableHead className="min-w-[160px]">Classroom</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesData?.data.map((course) => {
                      const s = scheduleData[course.id] || {
                        date: startDate || '',
                        startTime: '09:00',
                        duration: '180',
                        roomId: 'none',
                        maxMarks: '100',
                        passingMarks: '40',
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
                            <Input
                              type="number"
                              min="1"
                              value={s.maxMarks}
                              onChange={(e) =>
                                handleFieldChange(course.id, 'maxMarks', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={s.passingMarks}
                              onChange={(e) =>
                                handleFieldChange(course.id, 'passingMarks', e.target.value)
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
                            {roomsData?.data && roomsData.data.length === 0 && (
                              <Link
                                href="/admin/administration/rooms"
                                className="text-primary mt-1 block text-xs underline-offset-4 hover:underline"
                              >
                                Add rooms →
                              </Link>
                            )}
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
