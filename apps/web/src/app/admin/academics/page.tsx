"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@student-erp/ui";
import { Plus, Eye, Edit, Layers, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAdminPrograms } from "@/hooks/api/admin/usePrograms";

export default function AcademicsPage() {
  const [page, setPage] = useState(1);
  const { data: programsData, isLoading, isError } = useAdminPrograms(page, 50);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
          <p className="text-muted-foreground">Manage academic programs, curriculums, and courses.</p>
        </div>
        <div className="space-x-2">
          <Link href="/admin/academics/courses">
            <Button variant="outline">
              <Layers className="mr-2 h-4 w-4" /> Global Courses
            </Button>
          </Link>
          <Link href="/admin/academics/programs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Program
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programs</CardTitle>
          <CardDescription>View and manage academic offerings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError || !programsData ? (
            <div className="text-center py-10 text-destructive">
              Failed to load programs.
            </div>
          ) : programsData.data.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No programs found. Create a program to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programsData.data.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.code}</TableCell>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>{program.level.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{program.durationYears} Years</TableCell>
                    <TableCell>{program._count?.students || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/academics/programs/${program.id}`}>
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

