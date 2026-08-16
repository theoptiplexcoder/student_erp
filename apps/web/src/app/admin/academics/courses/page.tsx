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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
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
              <div className="border-border overflow-x-auto rounded-md border">
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
              <div className="text-muted-foreground mt-4 flex items-center justify-between text-sm">
                <div>
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
