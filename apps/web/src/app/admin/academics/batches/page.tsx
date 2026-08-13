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
import { useAdminBatches } from '@/hooks/api/admin/useBatches';

export default function BatchesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: batchesData, isLoading, isError } = useAdminBatches(page, 50, search);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground">Manage academic student batches.</p>
        </div>
        <Link href="/admin/academics/batches/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Batch
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batches List</CardTitle>
          <CardDescription>View and manage all batches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-72">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search batches..."
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
          ) : isError || !batchesData ? (
            <div className="text-destructive py-10 text-center">Failed to load batches.</div>
          ) : batchesData.data.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No batches found. Create a batch to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Admission Year</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchesData.data.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.admissionYear}</TableCell>
                    <TableCell>{batch.program?.name || 'N/A'}</TableCell>
                    <TableCell>{batch._count?.sections || 0}</TableCell>
                    <TableCell>{batch._count?.enrollments || 0}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Link href={`/admin/academics/batches/${batch.id}`}>
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
