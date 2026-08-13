'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@student-erp/ui';
import { Search, Filter, Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: studentsData, isLoading, isError } = useAdminStudents(page, 50, search);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
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
        <Button className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search by name, ID, or email..."
                className="pl-9"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-border">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>
          </div>
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
              <div className="border-border overflow-x-auto rounded-md border">
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
                          {student.admissionNumber}
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
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
