import {
  Card,
  CardContent,
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
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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
    return null;
  }
}

async function getCurriculumTermSections(termId: string) {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${API_URL}/academic/curriculum-terms/${termId}/sections`, {
      cache: 'no-store',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function TermSectionsPage({
  params,
}: {
  params: Promise<{ programId: string; curriculumId: string; termId: string }>;
}) {
  const { programId, curriculumId, termId } = await params;
  const curriculum = await getCurriculum(curriculumId);
  if (!curriculum) notFound();

  const term = curriculum.curriculumTerms?.find((t: any) => t.id === termId);
  if (!term) notFound();

  const sections = await getCurriculumTermSections(termId);

  // Derive global aggregate numbers
  let totalFacultyAssignments = 0;
  const globalDepartments = new Set<string>();

  sections.forEach((section: any) => {
    section.courseAssignments?.forEach((assignment: any) => {
      if (assignment.faculty) {
        totalFacultyAssignments++;
        if (assignment.faculty.department?.name) {
          globalDepartments.add(assignment.faculty.department.name);
        }
      }
    });
  });

  return (
    <div className="space-y-6 p-6">
      <div className="mb-2 flex items-center gap-2">
        <Link
          href={`/admin/academics/programs/${programId}/curriculums/${curriculumId}`}
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
          <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
          <p className="text-muted-foreground">
            {curriculum.program?.name} • {curriculum.name} • {term.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFacultyAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalDepartments.size}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {sections.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-lg font-medium">No sections found</p>
              <p className="text-muted-foreground text-sm">
                This term does not have any sections configured yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          sections.map((section: any) => {
            // Aggregate faculty for this specific section
            const uniqueFaculty = new Map();
            const sectionDepartments = new Set<string>();

            section.courseAssignments?.forEach((assignment: any) => {
              if (!assignment.faculty) return;

              const facultyId = assignment.faculty.id;
              if (assignment.faculty.department?.name) {
                sectionDepartments.add(assignment.faculty.department.name);
              }

              if (!uniqueFaculty.has(facultyId)) {
                uniqueFaculty.set(facultyId, {
                  ...assignment.faculty,
                  courses: [assignment.course],
                });
              } else {
                const existing = uniqueFaculty.get(facultyId);
                existing.courses.push(assignment.course);
              }
            });

            const facultyList = Array.from(uniqueFaculty.values());
            const studentCount = section._count?.students || 0;

            return (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{section.name}</CardTitle>
                      <p className="text-muted-foreground text-sm">Section Code: {section.code}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/academics/sections/${section.id}`}>View Section</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Department</h4>
                      {sectionDepartments.size === 0 ? (
                        <p className="text-muted-foreground text-sm">Department not assigned</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {Array.from(sectionDepartments).map((dept) => (
                            <Badge key={dept} variant="secondary">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <h4 className="mt-6 mb-2 text-sm font-semibold">Enrollment</h4>
                      <p className="text-sm">
                        {studentCount} / {section.capacity} Students
                      </p>
                    </div>

                    <div>
                      <h4 className="mb-2 flex items-center justify-between text-sm font-semibold">
                        <span>Faculty</span>
                        <Badge variant="outline">{facultyList.length} assigned</Badge>
                      </h4>

                      {facultyList.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No faculty assigned</p>
                      ) : (
                        <div className="space-y-4">
                          {facultyList.map((faculty: any) => (
                            <div key={faculty.id} className="border-primary border-l-2 pl-3">
                              <p className="text-sm font-medium">
                                {faculty.user?.firstName} {faculty.user?.lastName}
                                {faculty.teacherCode && (
                                  <span className="text-muted-foreground ml-1 font-normal">
                                    ({faculty.teacherCode})
                                  </span>
                                )}
                              </p>
                              <p className="text-muted-foreground mb-1 text-xs">
                                {faculty.department?.name || 'No department'}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {faculty.courses.map((course: any) => (
                                  <Badge
                                    key={course.id}
                                    variant="secondary"
                                    className="h-4 px-1.5 py-0 text-[10px]"
                                  >
                                    {course.code}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
