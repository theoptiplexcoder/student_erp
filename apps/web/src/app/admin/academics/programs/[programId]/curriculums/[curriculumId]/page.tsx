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
import { Plus, Eye, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-erp-web.vercel.app';

async function getCurriculum(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/admin/academic/curriculums/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Failed to fetch curriculum', e);
    return null;
  }
}

export default async function CurriculumPage({
  params,
}: {
  params: { programId: string; curriculumId: string };
}) {
  const curriculum = await getCurriculum(params.curriculumId);
  if (!curriculum) notFound();

  const isDraft = curriculum.status === 'DRAFT';

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={`/admin/academics/programs/${params.programId}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="text-muted-foreground text-sm">
              Academics / Programs / {curriculum.program?.code} / {curriculum.versionNumber}
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{curriculum.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={isDraft ? 'secondary' : 'default'}>{curriculum.status}</Badge>
            <span className="text-muted-foreground text-sm">
              Effective: {new Date(curriculum.effectiveFrom).toLocaleDateString()}
            </span>
          </div>
        </div>

        {isDraft && (
          <form
            action={async () => {
              'use server';
              await fetch(
                `${API_URL}/api/admin/academic/curriculums/${params.curriculumId}/publish`,
                { method: 'PATCH' },
              );
            }}
          >
            <Button>
              <CheckCircle className="mr-2 h-4 w-4" /> Publish Curriculum
            </Button>
          </form>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Academic Terms</CardTitle>
            <CardDescription>Manage terms and courses for this curriculum</CardDescription>
          </div>
          {isDraft && (
            <Link
              href={`/admin/academics/programs/${params.programId}/curriculums/${curriculum.id}/terms/new`}
            >
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Term
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {!curriculum.curriculumTerms || curriculum.curriculumTerms.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center">
              No terms found. Add a term (e.g., Semester 1) to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {curriculum.curriculumTerms.map((term: any) => (
                <div key={term.id} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{term.name}</h3>
                      <p className="text-muted-foreground text-sm">
                        Sequence: {term.sequence} • Credits: {term.creditRequirement || 0}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Link
                        href={`/admin/academics/programs/${params.programId}/curriculums/${curriculum.id}/terms/${term.id}`}
                      >
                        <Button variant="outline" size="sm">
                          Manage Courses
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {term.curriculumCourses?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {term.curriculumCourses.map((cc: any) => (
                          <TableRow key={cc.id}>
                            <TableCell className="font-medium">{cc.course.code}</TableCell>
                            <TableCell>{cc.course.name}</TableCell>
                            <TableCell>{cc.creditValue || cc.course.creditValue}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {cc.isMandatory ? 'Mandatory' : 'Elective'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-muted-foreground bg-muted/50 rounded p-4 text-center text-sm">
                      No courses assigned to this term.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
