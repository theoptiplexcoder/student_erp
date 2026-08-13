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
  Input,
} from '@student-erp/ui';
import { Plus, Eye, Edit, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useAdminDepartments } from '@/hooks/api/admin/useDepartments';

export default function DepartmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: departmentsData, isLoading, isError } = useAdminDepartments(page, 50, search);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage academic and administrative departments.</p>
        </div>
        <Link href="/admin/academics/departments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Department
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departments List</CardTitle>
          <CardDescription>View and manage all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-72">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search departments..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : isError || !departmentsData ? (
            <div className="text-destructive py-10 text-center">Failed to load departments.</div>
          ) : departmentsData.data.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No departments found. Create a department to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentsData.data.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.code}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept._count?.programs || 0}</TableCell>
                    <TableCell>{dept._count?.faculty || 0}</TableCell>
                    <TableCell>{dept._count?.courses || 0}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Link href={`/admin/academics/departments/${dept.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
