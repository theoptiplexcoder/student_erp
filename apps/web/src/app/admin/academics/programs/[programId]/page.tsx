'use client';

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
} from '@student-erp/ui';
import { Plus, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { useAdminProgram } from '@/hooks/api/admin/usePrograms';
import { ImportCurriculumButton } from './import-curriculum-button';

export default function ProgramPage({
  params,
}: {
  params: Promise<{ programId: string }> | { programId: string };
}) {
  const resolvedParams = 'then' in params ? use(params as Promise<{ programId: string }>) : params;
  const { data: program, isLoading, isError } = useAdminProgram(resolvedParams.programId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !program) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <div className="text-destructive">Program not found or failed to load.</div>
        <Link href="/admin/academics">
          <Button variant="outline">Back to Programs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link href="/admin/academics" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="text-muted-foreground text-sm">
              Academics / Programs / {program.code}
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
          <p className="text-muted-foreground">
            {program.level?.replace(/_/g, ' ')} • {program.durationYears} Years
            {program.department && ` • Department: ${program.department.name}`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Curriculums</CardTitle>
            <CardDescription>Manage curriculum versions for this program</CardDescription>
          </div>
          <div className="flex gap-2">
            <ImportCurriculumButton programId={program.id} />
            <Link href={`/admin/academics/programs/${program.id}/curriculums/new`}>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Create Curriculum
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!program.curriculums || program.curriculums.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No curriculums found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {program.curriculums.map((curriculum: any) => (
                  <TableRow key={curriculum.id}>
                    <TableCell className="font-medium">{curriculum.versionNumber}</TableCell>
                    <TableCell>{curriculum.name}</TableCell>
                    <TableCell>{new Date(curriculum.effectiveFrom).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          curriculum.status === 'ACTIVE'
                            ? 'default'
                            : curriculum.status === 'DRAFT'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {curriculum.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/academics/programs/${program.id}/curriculums/${curriculum.id}`}
                      >
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
