'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';
import { StudentFilters } from './components/student-filters';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@student-erp/ui';
import {
  Plus,
  MoreHorizontal,
  Users,
  UserCheck,
  UserPlus,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Status helpers
function getStatusBadge(status: string) {
  switch (status) {
    case 'ENROLLED':
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          {status}
        </span>
      );
    case 'APPLICANT':
      return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          {status}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
          {status}
        </span>
      );
  }
}

function getInitials(firstName?: string, lastName?: string) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
}

function InitialsAvatar({
  firstName,
  lastName,
  className = '',
}: {
  firstName?: string;
  lastName?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-admin-accent text-admin-primary dark:bg-admin-accent dark:text-admin-accent-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${className}`}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}

const statCardColors = [
  { border: 'border-l-blue-500', icon: 'text-blue-500', bg: 'bg-blue-500/10' },
  { border: 'border-l-emerald-500', icon: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { border: 'border-l-amber-500', icon: 'text-amber-500', bg: 'bg-amber-500/10' },
  { border: 'border-l-gray-400', icon: 'text-gray-500', bg: 'bg-gray-500/10' },
];

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

  // Compute stats from current data
  const totalStudents = studentsData?.meta?.total ?? 0;
  const enrolledCount =
    studentsData?.data?.filter((s) => s.lifecycleStatus === 'ENROLLED').length ?? 0;
  const applicantCount =
    studentsData?.data?.filter((s) => s.lifecycleStatus === 'APPLICANT').length ?? 0;
  const otherCount = totalStudents - enrolledCount - applicantCount;

  const statCards = [
    { label: 'Total Students', value: totalStudents, icon: Users },
    { label: 'Enrolled', value: enrolledCount, icon: UserCheck },
    { label: 'Applicants', value: applicantCount, icon: UserPlus },
    { label: 'Other', value: otherCount, icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-gray-50/50 p-6 md:p-8 dark:bg-gray-900/50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300">
              Admin
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white">Students</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Students
          </h1>
        </div>
        <Link href="/admin/admissions/students/new">
          <Button className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </Link>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`overflow-hidden border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800 ${statCardColors[i].border} border-l-4`}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {isLoading ? (
                      <Skeleton className="inline-block h-7 w-12" />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </p>
                </div>
                <div className={`rounded-full p-2 ${statCardColors[i].bg}`}>
                  <stat.icon className={`h-4 w-4 ${statCardColors[i].icon}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="px-6 pt-6 pb-3">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Filter and search students
          </CardTitle>
          <StudentFilters />
        </CardHeader>
      </Card>

      {/* Table / Content */}
      {isLoading ? (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {/* Table skeleton */}
            <div className="hidden overflow-x-auto md:block">
              <div className="w-full">
                {/* Header row */}
                <div className="flex border-b border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="w-28">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="w-32">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="w-24">
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="w-24">
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="w-20">
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                {/* Data rows */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center border-b border-gray-100 px-4 py-3 dark:border-gray-800"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <div className="w-28">
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="w-32">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="w-24">
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="w-24">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="w-20">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mobile skeleton */}
            <div className="space-y-4 p-4 md:hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError || !studentsData ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-red-50 p-3 dark:bg-red-900/20">
              <Search className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Failed to load students
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              There was an error communicating with the server.
            </p>
          </CardContent>
        </Card>
      ) : studentsData.data.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No students found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No students match your current filters.
            </p>
            <Link href="/admin/admissions/students/new" className="mt-4">
              <Button className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add your first student
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-800">
                      <TableHead className="text-xs font-medium uppercase">Student Name</TableHead>
                      <TableHead className="text-xs font-medium uppercase">Admission No</TableHead>
                      <TableHead className="text-xs font-medium uppercase">Program</TableHead>
                      <TableHead className="text-xs font-medium uppercase">Section</TableHead>
                      <TableHead className="text-xs font-medium uppercase">Status</TableHead>
                      <TableHead className="w-20 text-right text-xs font-medium uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.data.map((student) => (
                      <TableRow key={student.id} className="border-gray-100 dark:border-gray-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <InitialsAvatar
                              firstName={student.user?.firstName}
                              lastName={student.user?.lastName}
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {student.user?.firstName} {student.user?.lastName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {student.user?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {student.studentCode || student.admissionNumber}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {student.program?.name || '-'}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {student.section?.name || '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(student.lifecycleStatus)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/students/${student.studentCode || student.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 md:hidden">
                {studentsData.data.map((student) => (
                  <Link
                    key={student.id}
                    href={`/admin/students/${student.studentCode || student.id}`}
                    className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar
                          firstName={student.user?.firstName}
                          lastName={student.user?.lastName}
                          className="h-10 w-10"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {student.user?.firstName} {student.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {student.studentCode || student.admissionNumber}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(student.lifecycleStatus)}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {student.program?.name || '-'}
                        {student.section?.name ? ` · ${student.section.name}` : ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-4 py-3 text-sm text-gray-500 sm:flex-row dark:border-gray-800 dark:text-gray-400">
                <div>
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
                    <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= studentsData.meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen space-y-6 bg-gray-50/50 p-6 md:p-8 dark:bg-gray-900/50">
          {/* Header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-48" />
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          {/* Filters skeleton */}
          <Skeleton className="h-40 rounded-xl" />
          {/* Table skeleton */}
          <Skeleton className="h-80 rounded-xl" />
        </div>
      }
    >
      <StudentsList />
    </Suspense>
  );
}
