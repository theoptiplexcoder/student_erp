'use client';

import React from 'react';
import {
  useAdminStudentAcademicProgress,
  StudentAcademicProgram,
  StudentAcademicCourse,
} from '@/hooks/api/admin/useStudents';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@student-erp/ui';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  CircleDashed,
  Layers,
  Loader2,
} from 'lucide-react';

interface StudentAcademicProgressProps {
  studentId: string;
}

export function StudentAcademicProgress({ studentId }: StudentAcademicProgressProps) {
  const { data, isLoading, isError } = useAdminStudentAcademicProgress(studentId);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-3">
        <Loader2 className="text-admin-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading academic progress...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="py-8 text-center">
        <BookOpen className="text-muted-foreground/30 mx-auto h-10 w-10" />
        <p className="text-foreground mt-2 font-medium">Failed to load academic records</p>
        <p className="text-muted-foreground text-sm">
          Please check your connection or try again later.
        </p>
      </div>
    );
  }

  const { summary, programs, curriculum } = data;

  return (
    <div className="space-y-6">
      {/* Top High-Level Academic Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current Program */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Current Program
              </p>
              <GraduationCap className="text-admin-primary h-4 w-4" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-foreground text-lg font-bold">
                {summary.currentProgram?.name || 'Not Enrolled'}
              </h3>
            </div>
            {summary.currentProgram && (
              <Badge className="bg-admin-primary/10 text-admin-primary hover:bg-admin-primary/20 mt-1.5 border-0 font-semibold">
                CURRENT
              </Badge>
            )}
            {curriculum && (
              <p className="text-muted-foreground mt-2 truncate text-xs">
                Curriculum: <span className="text-foreground font-medium">{curriculum.name}</span> (
                {curriculum.versionNumber})
              </p>
            )}
          </CardContent>
        </Card>

        {/* Credits Progress */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Curriculum Credits
              </p>
              <Award className="text-admin-primary h-4 w-4" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold">
                {summary.totalCreditsEarned}{' '}
                <span className="text-muted-foreground text-sm font-normal">
                  / {summary.totalCreditsRequired}
                </span>
              </span>
              <span className="text-muted-foreground text-xs font-semibold">
                {summary.completionPercentage}%
              </span>
            </div>
            <div className="mt-3">
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-admin-primary h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, summary.completionPercentage))}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cumulative GPA / Grade */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Academic CGPA
              </p>
              <BookOpen className="text-admin-primary h-4 w-4" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-bold">
                {summary.cgpa !== null ? summary.cgpa.toFixed(2) : '—'}
              </span>
              <span className="text-muted-foreground text-xs font-normal">
                {summary.cgpa !== null ? 'Out of 4.0/10.0' : 'No graded courses'}
              </span>
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Based on completed and graded course assessments
            </p>
          </CardContent>
        </Card>

        {/* Courses Completed */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Courses Overview
              </p>
              <Layers className="text-admin-primary h-4 w-4" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-foreground text-2xl font-bold">
                {summary.completedCourses}{' '}
                <span className="text-muted-foreground text-sm font-normal">
                  / {summary.totalCourses}
                </span>
              </span>
            </div>
            <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {summary.completedCourses} Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {summary.inProgressCourses} Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grouped Programs in Curriculum */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-foreground text-lg font-bold tracking-tight">
              Curriculum Programs & Courses
            </h3>
            <p className="text-muted-foreground text-sm">
              Progression trajectory through programs in the curriculum with earned grades and
              enrollment status.
            </p>
          </div>
          {curriculum && (
            <Badge variant="outline" className="w-fit">
              {curriculum.name} ({curriculum.status})
            </Badge>
          )}
        </div>

        {programs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                No curriculum courses found for this student.
              </p>
            </CardContent>
          </Card>
        ) : (
          programs.map((program) => <ProgramProgressCard key={program.id} program={program} />)
        )}
      </div>
    </div>
  );
}

function ProgramProgressCard({ program }: { program: StudentAcademicProgram }) {
  return (
    <Card
      className={`border transition-all ${
        program.isCurrent
          ? 'ring-admin-primary/20 border-admin-primary/40 bg-admin-primary/[0.02] shadow-sm ring-2'
          : 'bg-card'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-foreground text-base font-bold">{program.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                Code: {program.code}
              </Badge>
              {program.isCurrent ? (
                <Badge className="bg-admin-primary text-admin-primary-foreground hover:bg-admin-primary font-bold">
                  CURRENT
                </Badge>
              ) : program.completedCourses === program.totalCourses && program.totalCourses > 0 ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500"
                >
                  COMPLETED
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {program.level || 'PROGRAM'}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs">
              {program.totalCredits} Total Credits • {program.completedCourses} of{' '}
              {program.totalCourses} courses completed
            </CardDescription>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={
                  program.isCurrent
                    ? 'text-admin-primary font-bold'
                    : program.completedCourses === program.totalCourses && program.totalCourses > 0
                      ? 'font-semibold text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                }
              >
                {program.isCurrent
                  ? 'Current Enrolled'
                  : program.completedCourses === program.totalCourses && program.totalCourses > 0
                    ? 'Completed Program'
                    : 'Curriculum Program'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Desktop Table View */}
        <div className="hidden rounded-md border md:block">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead className="w-[80px] text-center">Credits</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead className="w-[120px] text-center">Grade</TableHead>
                <TableHead className="w-[110px] text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {program.courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground h-16 text-center text-sm">
                    No courses configured for this program.
                  </TableCell>
                </TableRow>
              ) : (
                program.courses.map((course) => (
                  <CourseRow key={course.id} course={course} isCurrentProgram={program.isCurrent} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Stacked Card View */}
        <div className="space-y-3 md:hidden">
          {program.courses.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-xs">
              No courses configured for this program.
            </p>
          ) : (
            program.courses.map((course) => (
              <MobileCourseCard
                key={course.id}
                course={course}
                isCurrentProgram={program.isCurrent}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CourseRow({
  course,
  isCurrentProgram,
}: {
  course: StudentAcademicCourse;
  isCurrentProgram: boolean;
}) {
  return (
    <TableRow>
      <TableCell className="text-foreground font-mono text-xs font-semibold">
        {course.code}
      </TableCell>
      <TableCell className="text-foreground text-sm font-medium">{course.name}</TableCell>
      <TableCell className="text-muted-foreground text-center text-xs">
        {course.creditValue}
      </TableCell>
      <TableCell>
        <StatusBadge status={course.status} />
      </TableCell>
      <TableCell className="text-center">
        <GradeDisplay
          grade={course.grade}
          status={course.status}
          isCurrentProgram={isCurrentProgram}
        />
      </TableCell>
      <TableCell className="text-right text-xs">
        {course.percentage !== null && course.percentage !== undefined ? (
          <span className="text-foreground font-semibold">{course.percentage}%</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function MobileCourseCard({
  course,
  isCurrentProgram,
}: {
  course: StudentAcademicCourse;
  isCurrentProgram: boolean;
}) {
  return (
    <div className="bg-background space-y-2 rounded-lg border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-foreground font-mono text-xs font-bold">{course.code}</span>
            <span className="text-muted-foreground text-xs">• {course.creditValue} cr</span>
          </div>
          <p className="text-foreground mt-0.5 font-medium">{course.name}</p>
        </div>
        <GradeDisplay
          grade={course.grade}
          status={course.status}
          isCurrentProgram={isCurrentProgram}
        />
      </div>

      <div className="flex items-center justify-between border-t pt-1 text-xs">
        <StatusBadge status={course.status} />
        {course.percentage !== null && course.percentage !== undefined ? (
          <span className="text-muted-foreground">
            Score: <strong className="text-foreground">{course.percentage}%</strong>
          </span>
        ) : (
          <span className="text-muted-foreground">Score: —</span>
        )}
      </div>
    </div>
  );
}

function GradeDisplay({
  grade,
  status,
  isCurrentProgram,
}: {
  grade: string | null;
  status: string;
  isCurrentProgram: boolean;
}) {
  if (grade) {
    return (
      <Badge className="bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-400">
        GRADE: {grade}
      </Badge>
    );
  }

  if (status === 'COMPLETED') {
    return (
      <Badge variant="outline" className="border-green-600/30 text-xs text-green-600">
        PASSED
      </Badge>
    );
  }

  if (isCurrentProgram || status === 'ACTIVE' || status === 'ENROLLED') {
    return (
      <span className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
        <Clock className="h-3 w-3" /> In Progress
      </span>
    );
  }

  return <span className="text-muted-foreground text-xs">—</span>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </span>
      );
    case 'ACTIVE':
    case 'ENROLLED':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Clock className="h-3.5 w-3.5" /> Enrolled
        </span>
      );
    default:
      return (
        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <CircleDashed className="h-3.5 w-3.5" /> Pending
        </span>
      );
  }
}
