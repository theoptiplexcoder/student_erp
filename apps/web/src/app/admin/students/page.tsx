'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, Button } from '@student-erp/ui';
import Link from 'next/link';
import { Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { StudentFilters } from './components/student-filters';

function StudentsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const departmentId = searchParams.get('departmentId') || '';
  const programId = searchParams.get('programId') || '';
  const academicYearId = searchParams.get('academicYearId') || '';
  const batchId = searchParams.get('batchId') || '';
  const sectionId = searchParams.get('sectionId') || '';
  const status = searchParams.get('status') || '';
  const gender = searchParams.get('gender') || '';
  const admissionDateFrom = searchParams.get('admissionDateFrom') || '';
  const admissionDateTo = searchParams.get('admissionDateTo') || '';
  const guardianLinked = searchParams.get('guardianLinked');

  const {
    data: studentsData,
    isLoading,
    isError,
  } = useAdminStudents({
    page,
    pageSize: 50,
    search,
    departmentId,
    programId,
    academicYearId,
    batchId,
    sectionId,
    status,
    gender,
    admissionDateFrom,
    admissionDateTo,
    guardianLinked: guardianLinked ? guardianLinked === 'true' : undefined,
  });

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage enrolled students across all programs.
          </p>
        </div>
        <Link href="/admin/students/new">
          <Button className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="px-6 pt-6 pb-3">
          <StudentFilters />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : isError || !studentsData ? (
            <div className="text-destructive py-10 text-center">Failed to load students.</div>
          ) : studentsData.data.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No students found matching your criteria.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="border-border hidden overflow-x-auto rounded-md border md:block">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground bg-muted/50 border-border border-b text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Admission No</th>
                      <th className="px-4 py-3 font-medium">Program</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsData.data.map((student) => (
                      <tr
                        key={student.id}
                        className="border-border hover:bg-muted/30 border-b transition-colors last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          {student.user?.firstName} {student.user?.lastName}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {student.studentCode || student.admissionNumber}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {student.program?.name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              student.lifecycleStatus === 'ENROLLED'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'
                                : student.lifecycleStatus === 'APPLICANT'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'
                            }`}
                          >
                            {student.lifecycleStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/admin/students/${student.studentCode || student.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 md:hidden">
                {studentsData.data.map((student) => (
                  <div
                    key={student.id}
                    className="border-border bg-card text-card-foreground rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="font-medium">
                          {student.user?.firstName} {student.user?.lastName}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {student.studentCode || student.admissionNumber}
                        </div>
                      </div>
                      <Link href={`/admin/students/${student.studentCode || student.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">{student.program?.name || '-'}</div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          student.lifecycleStatus === 'ENROLLED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'
                            : student.lifecycleStatus === 'APPLICANT'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'
                        }`}
                      >
                        {student.lifecycleStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-muted-foreground mt-4 flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
                <div className="text-center md:text-left">
                  Showing {Math.min((page - 1) * 50 + 1, studentsData.meta.total)} to{' '}
                  {Math.min(page * 50, studentsData.meta.total)} of{' '}
                  {studentsData.meta.total.toLocaleString()} students
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= studentsData.meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      }
    >
      <StudentsList />
    </Suspense>
  );
}
