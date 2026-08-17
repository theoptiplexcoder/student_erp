'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@student-erp/ui';
import { Search, Filter, Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';

export default function ApplicationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  // Fetch only students with APPLICANT status
  const {
    data: studentsData,
    isLoading,
    isError,
  } = useAdminStudents(page, 50, search, 'APPLICANT');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review prospective student applications.
          </p>
        </div>
        <Button className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> New Application
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
            <div className="text-destructive py-10 text-center">Failed to load applications.</div>
          ) : studentsData.data.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No applications found matching your criteria.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="border-border hidden overflow-x-auto rounded-md border md:block">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground bg-muted/50 border-border border-b text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Applicant Name</th>
                      <th className="px-4 py-3 font-medium">Application ID</th>
                      <th className="px-4 py-3 font-medium">Program</th>
                      <th className="px-4 py-3 font-medium">Applied Date</th>
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
                          <div className="text-muted-foreground text-xs font-normal">
                            {student.user?.email || '-'}
                          </div>
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {student.admissionNumber || student.studentCode || '-'}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {student.program?.name || '-'}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {student.createdAt
                            ? new Date(student.createdAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">
                            {student.lifecycleStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/students/${student.id}`}>View</Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
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
                        <div className="text-muted-foreground text-xs">
                          {student.user?.email || '-'}
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          ID: {student.admissionNumber || student.studentCode || '-'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">
                          {student.lifecycleStatus}
                        </span>
                      </div>
                    </div>
                    <div className="border-border mt-3 flex items-center justify-between border-t pt-3 text-sm">
                      <div className="text-muted-foreground">
                        <div>{student.program?.name || '-'}</div>
                        <div className="text-xs">
                          {student.createdAt
                            ? new Date(student.createdAt).toLocaleDateString()
                            : '-'}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" asChild className="h-8">
                          <Link href={`/admin/students/${student.id}`}>View</Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-muted-foreground mt-4 flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
                <div className="text-center md:text-left">
                  Showing {Math.min((page - 1) * 50 + 1, studentsData.meta.total)} to{' '}
                  {Math.min(page * 50, studentsData.meta.total)} of{' '}
                  {studentsData.meta.total.toLocaleString()} applications
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
