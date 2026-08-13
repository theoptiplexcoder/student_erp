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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@student-erp/ui';
import { Loader2, Search, Award } from 'lucide-react';
import { useAdminExamResults } from '@/hooks/api/admin/useExams';

export default function ExamResultsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: resultsData, isLoading, isError } = useAdminExamResults(page, 50, search);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Exam Results</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage student examination results and grades.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <CardTitle>Results Directory</CardTitle>
              <CardDescription>Comprehensive list of student results across exams.</CardDescription>
            </div>
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search results..."
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
          ) : isError || !resultsData ? (
            <div className="text-destructive py-10 text-center">Failed to load exam results.</div>
          ) : resultsData.data.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">No results found.</div>
          ) : (
            <>
              <div className="border-border overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultsData.data.map((result) => {
                      const studentName = `${result.student.user.firstName} ${result.student.user.lastName}`;
                      return (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random`}
                                />
                                <AvatarFallback>
                                  {result.student.user.firstName[0]}
                                  {result.student.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{studentName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{result.examCourse?.exam?.name || '-'}</TableCell>
                          <TableCell>
                            <div>
                              <div>{result.examCourse?.course?.name || '-'}</div>
                              <div className="text-muted-foreground text-xs">
                                {result.examCourse?.course?.code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{result.marksObtained ?? '-'}</TableCell>
                          <TableCell>
                            {result.percentage ? `${result.percentage.toFixed(1)}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {result.grade ? (
                              <Badge variant="outline" className="bg-secondary/50 font-mono">
                                {result.grade}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                result.resultStatus === 'PASS'
                                  ? 'default'
                                  : result.resultStatus === 'FAIL'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {result.resultStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
                <div>
                  Showing {Math.min((page - 1) * 50 + 1, resultsData.meta.total)} to{' '}
                  {Math.min(page * 50, resultsData.meta.total)} of{' '}
                  {resultsData.meta.total.toLocaleString()} results
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
                    disabled={page >= resultsData.meta.totalPages}
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
