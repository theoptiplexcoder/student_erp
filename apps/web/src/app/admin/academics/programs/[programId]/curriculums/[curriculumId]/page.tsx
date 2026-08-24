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
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { CurriculumActions } from './curriculum-actions';

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

        <div className="flex gap-2">
          <CurriculumActions curriculumId={curriculum.id} programId={params.programId} />
          {isDraft && (
            <form
              action={async () => {
                'use server';
                const token = await getAuthToken();
                await fetch(`${API_URL}/academic/curriculums/${params.curriculumId}/activate`, {
                  method: 'POST',
                  headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                });
                revalidatePath(
                  `/admin/academics/programs/${params.programId}/curriculums/${params.curriculumId}`,
                );
              }}
            >
              <Button>
                <CheckCircle className="mr-2 h-4 w-4" /> Activate Curriculum
              </Button>
            </form>
          )}
        </div>
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

                  {term.electiveGroups?.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <h4 className="text-sm font-semibold">Elective Groups</h4>
                      <div className="flex flex-wrap gap-2">
                        {term.electiveGroups.map((eg: any) => (
                          <Badge key={eg.id} variant="secondary">
                            {eg.name}
                            {eg.requiredCredits > 0 ? ` (${eg.requiredCredits}cr)` : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {term.curriculumCourses?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Group</TableHead>
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
                            <TableCell>
                              {cc.electiveGroupId
                                ? term.electiveGroups?.find((g: any) => g.id === cc.electiveGroupId)
                                    ?.name
                                : '-'}
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
