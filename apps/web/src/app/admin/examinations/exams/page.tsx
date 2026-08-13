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
import { Loader2, Search, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { useAdminExams } from '@/hooks/api/admin/useExams';
import { format } from 'date-fns';

export default function ExamsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: examsData, isLoading, isError } = useAdminExams(page, 50, search);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Examinations</h1>
          <p className="text-muted-foreground mt-1">
            Manage institutional exams, timetables, and invigilation.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
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
              <div className="border-border overflow-x-auto rounded-md border">
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
                <div>
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
