'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminFaculty } from '@/hooks/api/admin/useFaculty';
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@student-erp/ui';
import { Search, Plus, User, Building, Briefcase } from 'lucide-react';

export default function FacultyPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data, isLoading } = useAdminFaculty(page, pageSize, search);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Faculty Management</h1>
        <Link href="/admin/faculty/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Faculty
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>All Faculty Members</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search faculty..."
                className="w-[250px] pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Teacher Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                      Loading faculty data...
                    </TableCell>
                  </TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                      No faculty members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                            <User className="text-primary h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold">
                              {faculty.user.firstName} {faculty.user.lastName}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {faculty.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{faculty.teacherCode}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Building className="text-muted-foreground mr-1 h-3.5 w-3.5" />
                          {faculty.department?.name || 'Unassigned'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Briefcase className="text-muted-foreground mr-1 h-3.5 w-3.5" />
                          <span className="capitalize">{faculty.employmentType.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={faculty.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {faculty.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/faculty/${faculty.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="block space-y-4 md:hidden">
            {isLoading ? (
              <div className="text-muted-foreground py-10 text-center">Loading faculty data...</div>
            ) : data?.data.length === 0 ? (
              <div className="text-muted-foreground py-10 text-center">
                No faculty members found.
              </div>
            ) : (
              data?.data.map((faculty) => (
                <div key={faculty.id} className="border-border bg-card rounded-lg border p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                        <User className="text-primary h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {faculty.user.firstName} {faculty.user.lastName}
                        </div>
                        <div className="text-muted-foreground text-xs">{faculty.user.email}</div>
                      </div>
                    </div>
                    <Badge variant={faculty.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {faculty.status}
                    </Badge>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Code</div>
                      <div>{faculty.teacherCode}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Type</div>
                      <div className="flex items-center capitalize">
                        <Briefcase className="mr-1 h-3 w-3" />
                        {faculty.employmentType.toLowerCase()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-muted-foreground text-xs">Department</div>
                      <div className="flex items-center">
                        <Building className="mr-1 h-3 w-3" />
                        {faculty.department?.name || 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end border-t pt-3">
                    <Link href={`/admin/faculty/${faculty.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
              <div className="text-muted-foreground order-2 text-sm md:order-1">
                Page {page} of {data.meta.totalPages}
              </div>
              <div className="order-1 flex w-full items-center justify-between space-x-2 md:order-2 md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
