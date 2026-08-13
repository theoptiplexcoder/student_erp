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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Faculty
        </Button>
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
          <div className="rounded-md border">
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

          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="text-muted-foreground text-sm">
                Page {page} of {data.meta.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
