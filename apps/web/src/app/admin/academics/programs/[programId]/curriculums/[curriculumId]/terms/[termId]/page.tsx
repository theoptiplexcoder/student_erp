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
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getCurriculum(id: string) {
  try {
    const res = await fetch(`${API_URL}/admin/academic/curriculums/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function TermPage({
  params,
}: {
  params: { programId: string; curriculumId: string; termId: string };
}) {
  const curriculum = await getCurriculum(params.curriculumId);
  if (!curriculum) notFound();

  const term = curriculum.curriculumTerms.find((t: any) => t.id === params.termId);
  if (!term) notFound();

  const isDraft = curriculum.status === 'DRAFT';

  return (
    <div className="space-y-6 p-6">
      <div className="mb-2 flex items-center gap-2">
        <Link
          href={`/admin/academics/programs/${params.programId}/curriculums/${params.curriculumId}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-muted-foreground text-sm">
          Academics / Programs / {curriculum.program?.code} / {curriculum.versionNumber} /{' '}
          {term.name}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{term.name} Courses</h1>
          <p className="text-muted-foreground">Manage courses for this specific term.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Curriculum Courses</CardTitle>
            <CardDescription>Courses associated with this term in the curriculum</CardDescription>
          </div>
          {isDraft && (
            <div className="space-x-2">
              <Link
                href={`/admin/academics/programs/${params.programId}/curriculums/${curriculum.id}/terms/${term.id}/courses/add`}
              >
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Existing Course
                </Button>
              </Link>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!term.curriculumCourses || term.curriculumCourses.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No courses found for this term.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Type</TableHead>
                  {isDraft && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {term.curriculumCourses.map((cc: any) => (
                  <TableRow key={cc.id}>
                    <TableCell>{cc.sequence}</TableCell>
                    <TableCell className="font-medium">{cc.course.code}</TableCell>
                    <TableCell>{cc.course.name}</TableCell>
                    <TableCell>{cc.creditValue || cc.course.creditValue}</TableCell>
                    <TableCell>
                      <Badge variant={cc.isMandatory ? 'default' : 'secondary'}>
                        {cc.isMandatory ? 'Mandatory' : 'Elective'}
                      </Badge>
                    </TableCell>
                    {isDraft && (
                      <TableCell className="text-right">
                        <form
                          action={async () => {
                            'use server';
                            await fetch(`${API_URL}/admin/academic/curriculum-courses/${cc.id}`, {
                              method: 'DELETE',
                            });
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </TableCell>
                    )}
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
