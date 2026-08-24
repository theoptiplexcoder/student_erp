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
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { AddCourseDialog } from '../add-course-dialog';

const getApiUrl = () => {
  const url = process.env['NEXT_PUBLIC_API_URL'] || 'https://student-erp-api.onrender.com';
  return url.endsWith('/api/v1') ? url : `${url.replace(/\/$/, '')}/api/v1`;
};
const API_URL = getApiUrl();

async function getAuthToken() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

async function getCurriculum(id: string) {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/academic/curriculums/${id}`, {
      cache: 'no-store',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Failed to fetch curriculum', e);
    return null;
  }
}

export default async function ManageCoursesPage({
  params,
}: {
  params: Promise<{ programId: string; curriculumId: string }>;
}) {
  const { programId, curriculumId } = await params;
  const curriculum = await getCurriculum(curriculumId);

  if (!curriculum) {
    notFound();
  }

  const isDraft = curriculum.status === 'DRAFT';

  let totalCourses = 0;
  let totalCredits = 0;
  curriculum.curriculumTerms?.forEach((term: any) => {
    term.curriculumCourses?.forEach((cc: any) => {
      totalCourses++;
      totalCredits += cc.creditValue || cc.course?.creditValue || 0;
    });
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href={`/admin/academics/programs/${programId}/curriculums/${curriculumId}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="text-muted-foreground text-sm">
              Academics / Programs / {curriculum.program?.code} / {curriculum.versionNumber}
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Courses</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant={isDraft ? 'secondary' : 'default'}>{curriculum.status}</Badge>
            <span className="text-muted-foreground text-sm">{curriculum.name}</span>
            <span className="text-muted-foreground border-l pl-2 text-sm">
              Total Courses: {totalCourses}
            </span>
            <span className="text-muted-foreground border-l pl-2 text-sm">
              Total Credits: {totalCredits}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {!curriculum.curriculumTerms || curriculum.curriculumTerms.length === 0 ? (
          <div className="text-muted-foreground bg-card rounded-lg border py-10 text-center">
            No terms found in this curriculum. Add terms on the curriculum page first.
          </div>
        ) : (
          curriculum.curriculumTerms.map((term: any) => (
            <Card key={term.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{term.name}</CardTitle>
                  <CardDescription>
                    Sequence: {term.sequence} • Required Credits: {term.creditRequirement || 0} •
                    Term Credits:{' '}
                    {term.curriculumCourses?.reduce(
                      (sum: number, cc: any) =>
                        sum + (cc.creditValue || cc.course?.creditValue || 0),
                      0,
                    ) || 0}
                  </CardDescription>
                </div>
                {isDraft && (
                  <div className="space-x-2">
                    <AddCourseDialog
                      programId={programId}
                      curriculumId={curriculum.id}
                      curriculumTerms={curriculum.curriculumTerms}
                      defaultTermId={term.id}
                      triggerButton={
                        <Button size="sm" variant="outline">
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      }
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {term.curriculumCourses?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
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
                                  const token = await getAuthToken();
                                  await fetch(`${API_URL}/academic/curriculum-courses/${cc.id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                    },
                                  });
                                  revalidatePath(
                                    `/admin/academics/programs/${programId}/curriculums/${curriculumId}/courses`,
                                  );
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
                ) : (
                  <div className="text-muted-foreground bg-muted/50 rounded p-4 text-center text-sm">
                    No courses in this term. Click Edit to add courses.
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
