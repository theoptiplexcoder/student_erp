'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  PageHeader,
  PageContainer,
  StatusBadge,
  EmptyState,
  Badge,
  Skeleton,
  Input,
} from '@student-erp/ui';
import {
  ArrowLeft,
  Users,
  Search,
  UserPlus,
  Upload,
  ArrowRight,
  GraduationCap,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';
import { useAdminSection } from '@/hooks/api/admin/useSections';
import { QuickAdmissionModal } from '../../components/quick-admission-modal';
import { BulkUploadModal } from '../../components/bulk-upload-modal';

function getInitials(firstName?: string, lastName?: string) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
}

export default function SectionStudentsPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = use(params);
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [isQuickAdmitOpen, setIsQuickAdmitOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Section details
  const { data: section, isLoading: isLoadingSection } = useAdminSection(sectionId);

  // Students in this section
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    refetch,
  } = useAdminStudents({
    sectionId,
    pageSize: 200,
    search: search.trim() || undefined,
  });

  const students = studentsData?.data || [];
  const enrolledCount = students.filter((s) => s.lifecycleStatus === 'ENROLLED').length;
  const capacity = section?.capacity || 0;
  const fillPercent =
    capacity > 0 ? Math.min(100, Math.round((students.length / capacity) * 100)) : 0;

  return (
    <PageContainer>
      <div className="mb-2 flex items-center gap-2">
        <Link href="/admin/students" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-muted-foreground text-xs sm:text-sm">
          <Link href="/admin/students" className="hover:underline">
            Students
          </Link>{' '}
          /{' '}
          <span className="text-foreground font-medium">
            {isLoadingSection ? 'Loading section...' : `${section?.name} (${section?.code})`}
          </span>
        </div>
      </div>

      <PageHeader
        title={section?.name ? `${section.name} — Student Roster` : 'Section Student Roster'}
        description={
          section?.program?.name
            ? `Program: ${section.program.name} (${section.program.code || ''}) • Academic Year: ${
                section.academicYear?.name || 'Current'
              }`
            : 'Enrolled student roster and section records.'
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkUploadOpen(true)}
              className="h-8 gap-1.5 text-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              Bulk Import
            </Button>
            <Button
              size="sm"
              onClick={() => setIsQuickAdmitOpen(true)}
              className="h-8 gap-1.5 text-xs shadow-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Admit Student
            </Button>
          </div>
        }
      />

      {/* Capacity & Stats Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border/80 p-4">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Enrolled Students</span>
            <Users className="text-primary h-4 w-4" />
          </div>
          <div className="text-foreground mt-1 text-2xl font-bold">
            {isLoadingStudents ? <Skeleton className="h-7 w-12" /> : students.length}
          </div>
          <p className="text-muted-foreground mt-0.5 text-[11px]">Active in this section</p>
        </Card>

        <Card className="border-border/80 p-4">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Section Capacity</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-foreground mt-1 text-2xl font-bold">
            {isLoadingSection ? <Skeleton className="h-7 w-12" /> : capacity}
          </div>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            {capacity > 0 ? `${fillPercent}% filled` : 'No limit set'}
          </p>
        </Card>

        <Card className="border-border/80 p-4">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Program</span>
            <GraduationCap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-foreground mt-1 truncate text-base font-bold">
            {isLoadingSection ? <Skeleton className="h-6 w-24" /> : section?.program?.code || '—'}
          </div>
          <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
            {section?.program?.name || 'Unassigned'}
          </p>
        </Card>

        <Card className="border-border/80 p-4">
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>Academic Term</span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-foreground mt-1 truncate text-base font-bold">
            {isLoadingSection ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              section?.academicYear?.name || 'Active Term'
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            {section?.semester ? `Semester ${section.semester}` : 'Regular Term'}
          </p>
        </Card>
      </div>

      {/* Search and Filters Toolbar */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                placeholder="Search students in this section by name, USN, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Total {students.length} student{students.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      {isLoadingStudents ? (
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-0">
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="border-border/40 flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No students match your search' : 'No students enrolled in this section'}
          description={
            search
              ? 'Try adjusting your search query.'
              : 'Directly admit students or import an Excel roster into this section.'
          }
          action={{
            label: 'Admit Student',
            onClick: () => setIsQuickAdmitOpen(true),
            icon: UserPlus,
          }}
        />
      ) : (
        <Card className="border-border/80 overflow-hidden shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                      Gender
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Contact
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
                  {students.map((student) => (
                    <TableRow
                      key={student.id}
                      className="hover:bg-muted/40 border-border/60 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/students/${student.id}`)}
                    >
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold select-none">
                            {getInitials(student.user?.firstName, student.user?.lastName)}
                          </div>
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
                      <TableCell className="text-foreground py-2.5 text-xs">
                        {student.gender || '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2.5 text-xs">
                        {student.user?.phone || '—'}
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
      )}

      {/* Modals for Quick Admit and Bulk Import */}
      {section && (
        <>
          <QuickAdmissionModal
            isOpen={isQuickAdmitOpen}
            onClose={() => setIsQuickAdmitOpen(false)}
            programId={section.program?.id}
            programName={section.program?.name}
            sectionId={section.id}
            sectionName={section.name}
          />

          <BulkUploadModal
            isOpen={isBulkUploadOpen}
            onClose={() => setIsBulkUploadOpen(false)}
            programId={section.program?.id}
            programName={section.program?.name}
            sectionId={section.id}
            sectionName={section.name}
          />
        </>
      )}
    </PageContainer>
  );
}
