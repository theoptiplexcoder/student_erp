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
import { useAdminSections } from '@/hooks/api/admin/useSections';

export default function SectionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: sectionsData, isLoading, isError } = useAdminSections(page, 50, search);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
          <p className="text-muted-foreground">Manage academic sections and class groups.</p>
        </div>
        <Link href="/admin/academics/sections/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Section
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sections List</CardTitle>
          <CardDescription>View and manage all sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-72">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search sections..."
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
          ) : isError || !sectionsData ? (
            <div className="text-destructive py-10 text-center">Failed to load sections.</div>
          ) : sectionsData.data.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No sections found. Create a section to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectionsData.data.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.code}</TableCell>
                    <TableCell>{section.name}</TableCell>
                    <TableCell>{section.program?.name || 'N/A'}</TableCell>
                    <TableCell>{section.batch?.name || 'N/A'}</TableCell>
                    <TableCell>{section.capacity}</TableCell>
                    <TableCell>{section._count?.students || 0}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Link href={`/admin/academics/sections/${section.id}`}>
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
