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
import { Plus, Eye, Edit, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useAdminCourses } from '@/hooks/api/admin/useCourses';

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: coursesData, isLoading, isError } = useAdminCourses(page, 50, search);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Courses</h1>
          <p className="text-muted-foreground">Manage academic courses and curriculum.</p>
        </div>
        <Link href="/admin/academics/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <CardTitle>Course List</CardTitle>
              <CardDescription>View and manage all courses</CardDescription>
            </div>
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search courses..."
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
          ) : isError || !coursesData ? (
            <div className="text-destructive py-10 text-center">Failed to load courses.</div>
          ) : coursesData.data.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No courses found. Add a course to get started.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="border-border hidden overflow-x-auto rounded-md border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesData.data.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>{course.program?.name || '-'}</TableCell>
                        <TableCell>{course.department?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Link href={`/admin/academics/courses/${course.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/academics/courses/${course.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="block space-y-4 md:hidden">
                {coursesData.data.map((course) => (
                  <div key={course.id} className="border-border bg-card rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="text-base font-semibold">{course.name}</div>
                        <div className="text-muted-foreground text-sm font-medium">
                          {course.code}
                        </div>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="border-border my-3 grid grid-cols-2 gap-2 border-y py-2 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Credits</div>
                        <div>{course.credits}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Program</div>
                        <div className="truncate">{course.program?.name || '-'}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-muted-foreground text-xs">Department</div>
                        <div>{course.department?.name || '-'}</div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/academics/courses/${course.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/academics/courses/${course.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-muted-foreground mt-4 flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
                <div className="text-center md:text-left">
                  Showing {Math.min((page - 1) * 50 + 1, coursesData.meta.total)} to{' '}
                  {Math.min(page * 50, coursesData.meta.total)} of{' '}
                  {coursesData.meta.total.toLocaleString()} courses
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
                    disabled={page >= coursesData.meta.totalPages}
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
