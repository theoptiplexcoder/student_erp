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
  PageHeader,
  PageContainer,
  StatCard,
  StatusBadge,
  EmptyState,
} from '@student-erp/ui';
import {
  Plus,
  Users,
  UserCheck,
  UserPlus,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  Download,
} from 'lucide-react';

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
      className={`bg-primary/10 text-primary border-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold select-none ${className}`}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}

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
    refetch,
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

  const totalStudents = studentsData?.meta?.total ?? 0;
  const enrolledCount =
    studentsData?.data?.filter((s) => s.lifecycleStatus === 'ENROLLED').length ?? 0;
  const applicantCount =
    studentsData?.data?.filter((s) => s.lifecycleStatus === 'APPLICANT').length ?? 0;
  const otherCount = totalStudents - enrolledCount - applicantCount;

  const statCards = [
    { label: 'Total Students', value: totalStudents.toLocaleString(), icon: Users },
    { label: 'Enrolled', value: enrolledCount.toLocaleString(), icon: UserCheck },
    { label: 'Applicants', value: applicantCount.toLocaleString(), icon: UserPlus },
    { label: 'Other Statuses', value: otherCount.toLocaleString(), icon: GraduationCap },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Students"
        description="Directory of enrolled students, applicants, and academic records across all departments."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Link href="/admin/admissions/students/new">
              <Button size="sm" className="h-8 gap-1.5 text-xs shadow-xs">
                <Plus className="h-3.5 w-3.5" />
                Add Student
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={isLoading ? <Skeleton className="h-7 w-12" /> : stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* GitHub/Primer-style Filter and Query Bar */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="p-4 pb-3 sm:p-5">
          <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Filters & Search
          </CardTitle>
          <StudentFilters />
        </CardHeader>
      </Card>

      {/* Main Table / State Section */}
      {isLoading ? (
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-0">
            <div className="hidden overflow-x-auto md:block">
              <div className="w-full">
                <div className="border-border/70 bg-muted/30 flex border-b px-4 py-2.5">
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
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border-border/50 flex items-center border-b px-4 py-3">
                    <div className="flex flex-1 items-center gap-3">
                      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <div className="w-28">
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                    <div className="w-32">
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                    <div className="w-24">
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                    <div className="w-24">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="w-20">
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-border/70 rounded-lg border p-3.5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError || !studentsData ? (
        <EmptyState
          icon={Search}
          title="Failed to load students"
          description="Could not communicate with the student records server. Please verify your connection or try again."
          action={{
            label: 'Retry Request',
            onClick: () => refetch(),
          }}
        />
      ) : studentsData.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students match your criteria"
          description="Try broadening or clearing your active filters to find student records."
          action={{
            label: 'Add New Student',
            onClick: () => router.push('/admin/admissions/students/new'),
            icon: Plus,
          }}
        />
      ) : (
        <div className="space-y-4">
          <Card className="border-border/80 overflow-hidden shadow-xs">
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/70 bg-muted/40">
                      <TableHead className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Student
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Admission / USN
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Program
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Section
                      </TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground w-20 text-right text-xs font-semibold tracking-wider uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.data.map((student) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-muted/40 border-border/60 cursor-pointer transition-colors"
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                      >
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-3">
                            <InitialsAvatar
                              firstName={student.user?.firstName}
                              lastName={student.user?.lastName}
                            />
                            <div className="min-w-0">
                              <p className="text-foreground truncate text-xs font-medium">
                                {student.user?.firstName} {student.user?.lastName}
                              </p>
                              <p className="text-muted-foreground truncate text-[11px]">
                                {student.user?.email || student.studentCode}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="text-foreground font-mono text-xs font-medium">
                            {student.studentCode}
                          </div>
                          {student.usn && (
                            <div className="text-muted-foreground font-mono text-[10px]">
                              {student.usn}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="text-foreground max-w-[200px] truncate text-xs">
                            {student.program?.name || '—'}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="text-foreground text-xs">
                            {student.section?.name || 'Unassigned'}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <StatusBadge
                            status={student.lifecycleStatus?.toLowerCase() as any}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <Link
                            href={`/admin/students/${student.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:bg-muted/80 text-muted-foreground hover:text-foreground inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List */}
              <div className="divide-border/60 divide-y md:hidden">
                {studentsData.data.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => router.push(`/admin/students/${student.id}`)}
                    className="hover:bg-muted/30 active:bg-muted/50 cursor-pointer space-y-2 p-3.5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <InitialsAvatar
                          firstName={student.user?.firstName}
                          lastName={student.user?.lastName}
                        />
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-xs font-medium">
                            {student.user?.firstName} {student.user?.lastName}
                          </p>
                          <p className="text-muted-foreground truncate text-[11px]">
                            {student.studentCode}
                          </p>
                        </div>
                      </div>
                      <StatusBadge
                        status={student.lifecycleStatus?.toLowerCase() as any}
                        size="sm"
                      />
                    </div>
                    <div className="text-muted-foreground border-border/40 flex items-center justify-between border-t pt-1 text-[11px]">
                      <span>{student.program?.name || 'No program'}</span>
                      <span>Sec: {student.section?.name || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* GitHub/Stripe-style Compact Pagination Bar */}
          <div className="text-muted-foreground flex items-center justify-between px-1 py-1 text-xs">
            <div>
              Showing{' '}
              <span className="text-foreground font-medium">{studentsData.data.length}</span> of{' '}
              <span className="text-foreground font-medium">{totalStudents}</span> students
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>
              <div className="text-foreground px-2 text-xs font-medium">
                Page {page} of {Math.max(1, Math.ceil(totalStudents / 50))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs"
                disabled={page * 50 >= totalStudents}
                onClick={() => setPage(page + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </PageContainer>
      }
    >
      <StudentsList />
    </Suspense>
  );
}
