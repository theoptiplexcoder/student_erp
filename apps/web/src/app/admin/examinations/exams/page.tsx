'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Input,
} from '@student-erp/ui';
import { Loader2, Search, Calendar as CalendarIcon, FileText, Plus, Trash2 } from 'lucide-react';
import { useAdminExams, useDeleteExam } from '@/hooks/api/admin/useExams';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminCurriculumsByProgram } from '@/hooks/api/admin/useCurriculums';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';
import { format } from 'date-fns';
import { ScheduleExamForm } from './ScheduleExamForm';

export default function ExamsPage() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [programId, setProgramId] = useState('');
  const [curriculumId, setCurriculumId] = useState('');
  const [termId, setTermId] = useState('');

  const {
    data: examsData,
    isLoading,
    isError,
  } = useAdminExams(page, 50, search, programId, curriculumId, termId);
  const deleteMutation = useDeleteExam();

  const { data: programsData } = useAdminPrograms(1, 100);
  const { data: curriculumsData } = useAdminCurriculumsByProgram(programId);
  const { data: termsData } = useAdminTerms(curriculumId || undefined);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        'Are you sure you want to delete this exam schedule? This will also remove calendar events.',
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete exam.');
      }
    }
  };

  if (isScheduling) {
    return <ScheduleExamForm onCancel={() => setIsScheduling(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Examinations</h1>
          <p className="text-muted-foreground mt-1">
            Manage institutional exams, timetables, and invigilation.
          </p>
        </div>
        <Button onClick={() => setIsScheduling(true)}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Examination
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <CardTitle>Upcoming Exams</CardTitle>
                <CardDescription>Examinations scheduled across all programs.</CardDescription>
              </div>
              <div className="relative max-w-sm flex-1">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search exams..."
                  className="pl-9"
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full max-w-[200px] items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                value={programId}
                onChange={(e) => {
                  setProgramId(e.target.value);
                  setCurriculumId('');
                  setPage(1);
                }}
              >
                <option value="">All Programs</option>
                {programsData?.data?.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full max-w-[200px] items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={curriculumId}
                disabled={!programId}
                onChange={(e) => {
                  setCurriculumId(e.target.value);
                  setTermId('');
                  setPage(1);
                }}
              >
                <option value="">All Curriculums</option>
                {curriculumsData?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (v{c.versionNumber})
                  </option>
                ))}
              </select>

              <select
                className="border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full max-w-[200px] items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                value={termId}
                onChange={(e) => {
                  setTermId(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Terms</option>
                {termsData?.map((term: any) => {
                  const curriculumName = term.curriculum?.name || term.program?.name || '';
                  const deptName =
                    term.curriculum?.program?.department?.name ||
                    term.department?.name ||
                    term.program?.department?.name ||
                    '';
                  const extras = [curriculumName, deptName].filter(Boolean).join(' - ');
                  return (
                    <option key={term.id} value={term.id}>
                      {term.name}{' '}
                      {extras
                        ? `(${extras})`
                        : term.academicYear?.name
                          ? `(${term.academicYear.name})`
                          : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : isError || !examsData ? (
            <div className="text-destructive py-10 text-center">Failed to load exams.</div>
          ) : examsData.data.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">No exams found.</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="border-border hidden overflow-x-auto rounded-md border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examsData.data.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="text-muted-foreground h-4 w-4" />
                            {exam.name}
                          </div>
                        </TableCell>
                        <TableCell>{exam.code || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.examType.replace(/_/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell>{exam.academicYear?.name || '-'}</TableCell>
                        <TableCell>{exam.term?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              exam.status === 'PUBLISHED'
                                ? 'default'
                                : exam.status === 'DRAFT'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {exam.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <CalendarIcon className="h-3 w-3" />
                            {exam.startDate ? format(new Date(exam.startDate), 'MMM d, yyyy') : '-'}
                            {' to '}
                            {exam.endDate ? format(new Date(exam.endDate), 'MMM d, yyyy') : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(exam.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="block space-y-4 md:hidden">
                {examsData.data.map((exam) => (
                  <div key={exam.id} className="border-border bg-card rounded-lg border p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          <FileText className="text-primary h-4 w-4" />
                          {exam.name}
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          Code: {exam.code || '-'}
                        </div>
                      </div>
                      <Badge
                        variant={
                          exam.status === 'PUBLISHED'
                            ? 'default'
                            : exam.status === 'DRAFT'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {exam.status}
                      </Badge>
                    </div>

                    <div className="border-border my-3 grid grid-cols-2 gap-3 border-y py-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Type</div>
                        <Badge variant="outline" className="mt-1 font-normal">
                          {exam.examType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Academic Year</div>
                        <div className="mt-1">{exam.academicYear?.name || '-'}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground text-xs">Term</div>
                        <div className="mt-1">{exam.term?.name || '-'}</div>
                      </div>
                    </div>

                    <div className="text-muted-foreground flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {exam.startDate ? format(new Date(exam.startDate), 'MMM d') : '-'}
                        {' - '}
                        {exam.endDate ? format(new Date(exam.endDate), 'MMM d, yyyy') : '-'}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(exam.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-muted-foreground mt-4 flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
                <div className="text-center md:text-left">
                  Showing {Math.min((page - 1) * 50 + 1, examsData.meta.total)} to{' '}
                  {Math.min(page * 50, examsData.meta.total)} of{' '}
                  {examsData.meta.total.toLocaleString()} exams
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
                    disabled={page >= examsData.meta.totalPages}
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
