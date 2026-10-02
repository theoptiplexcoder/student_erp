'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { StudentFilters } from './components/student-filters';
import { SectionsProgramsView } from './components/sections-programs-view';
import {
  Button,
  Card,
  CardContent,
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
  Users,
  UserCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  LayoutGrid,
  List,
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

function StudentsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Tab View: default to 'sections' per user requirement
  const currentView = searchParams.get('view') || 'sections';

  const setView = (view: 'sections' | 'directory') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const departmentId = searchParams.get('departmentId') || '';
  const programId = searchParams.get('programId') || '';
  const academicYearId = searchParams.get('academicYearId') || '';
  const sectionId = searchParams.get('sectionId') || '';
  const status = searchParams.get('status') || '';
  const gender = searchParams.get('gender') || '';
  const admissionDateFrom = searchParams.get('admissionDateFrom') || '';
  const admissionDateTo = searchParams.get('admissionDateTo') || '';
  const guardianLinked = searchParams.get('guardianLinked');

  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isError,
    refetch,
  } = useAdminStudents({
    page,
    pageSize: 50,
    search,
    departmentId,
    programId,
    academicYearId,
    sectionId,
    status,
    gender,
    admissionDateFrom,
    admissionDateTo,
    guardianLinked: guardianLinked ? guardianLinked === 'true' : undefined,
  });

  const { data: programsData } = useAdminPrograms(1, 100);
  const { data: sectionsData } = useAdminSections(1, 100);

  const totalPrograms = programsData?.meta?.total ?? programsData?.data?.length ?? 0;
  const totalSections = sectionsData?.meta?.total ?? sectionsData?.data?.length ?? 0;
  const totalStudents = studentsData?.meta?.total ?? 0;
  const enrolledCount =
    studentsData?.data?.filter((s) => s.lifecycleStatus === 'ENROLLED').length ?? 0;

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const statCards = [
    { label: 'Total Programs', value: totalPrograms.toLocaleString(), icon: GraduationCap },
    { label: 'Active Sections', value: totalSections.toLocaleString(), icon: LayoutGrid },
    { label: 'Total Students', value: totalStudents.toLocaleString(), icon: Users },
    { label: 'Enrolled', value: enrolledCount.toLocaleString(), icon: UserCheck },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Students & Sections"
        description="Organize, manage, and view students grouped by their academic programs and sections."
      />

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={isLoadingStudents ? <Skeleton className="h-7 w-12" /> : stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* View Switcher Tabs */}
      <div className="border-border/70 flex items-center justify-between border-b pb-3">
        <div className="border-border/80 bg-muted/30 flex items-center gap-1.5 rounded-lg border p-1">
          <Button
            variant={currentView === 'sections' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('sections')}
            className={`h-7 gap-1.5 px-3 text-xs ${
              currentView === 'sections' ? 'shadow-xs' : 'text-muted-foreground'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Sections & Programs View
          </Button>
          <Button
            variant={currentView === 'directory' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('directory')}
            className={`h-7 gap-1.5 px-3 text-xs ${
              currentView === 'directory' ? 'shadow-xs' : 'text-muted-foreground'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            All Students Directory
          </Button>
        </div>
      </div>

      {/* View Content */}
      {currentView === 'sections' ? (
        <SectionsProgramsView />
      ) : (
        <div className="space-y-4">
          {/* Compact Filter Card */}
          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-3 sm:p-4">
              <StudentFilters />
            </CardContent>
          </Card>

          {/* Table View */}
          {isLoadingStudents ? (
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-0">
                <div className="space-y-3 p-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
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
            />
          ) : (
            <div className="space-y-4">
              <Card className="border-border/80 overflow-hidden shadow-xs">
                <CardContent className="p-0">
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
                </CardContent>
              </Card>

              {/* Pagination */}
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
      <StudentsPageContent />
    </Suspense>
  );
}
