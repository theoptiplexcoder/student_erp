'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAdminFacultyDetails,
  useFacultyAssignments,
  useAssignFacultyClass,
} from '@/hooks/api/admin/useFaculty';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Badge,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@student-erp/ui';
import { ArrowLeft, User, Building, Briefcase, Mail } from 'lucide-react';
import Link from 'next/link';

import { useAdminCourses } from '@/hooks/api/admin/useCourses';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';

function FacultyAssignments({ facultyId }: { facultyId: string }) {
  const { data: assignments, isLoading } = useFacultyAssignments(facultyId);
  const { data: coursesRes } = useAdminCourses(1, 100);
  const { data: sectionsRes } = useAdminSections(1, 100);
  const { data: terms } = useAdminTerms();

  const courses = coursesRes?.data || [];
  const sections = sectionsRes?.data || [];
  const termList = terms || [];

  const assignClass = useAssignFacultyClass();
  const [courseId, setCourseId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [termId, setTermId] = useState('');

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    assignClass.mutate(
      { id: facultyId, data: { courseId, sectionId, termId } },
      {
        onSuccess: () => {
          setCourseId('');
          setSectionId('');
          setTermId('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign New Class</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssign} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Course</label>
              <select
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Course...</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Section</label>
              <select
                required
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Section...</option>
                {sections.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Term</label>
              <select
                required
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Term...</option>
                {termList.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={assignClass.isPending}>
              {assignClass.isPending ? 'Assigning...' : 'Assign Class'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-4 text-center">Loading assignments...</p>
          ) : !assignments || assignments.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center">No classes assigned.</p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment: any) => (
                <div
                  key={assignment.id}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h4 className="font-semibold">
                      {assignment.course?.name || assignment.courseId}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Section: {assignment.section?.name || assignment.sectionId} | Term:{' '}
                      {assignment.academicTerm?.name || assignment.termId}
                    </p>
                  </div>
                  <Badge variant="outline">Assigned</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FacultyDetailsPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const router = useRouter();
  const { facultyId } = use(params);
  const { data: faculty, isLoading, error } = useAdminFacultyDetails(facultyId);

  if (isLoading) {
    return <div className="text-muted-foreground p-6 text-center">Loading faculty details...</div>;
  }

  if (error || !faculty) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-4">Failed to load faculty details.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Details</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/faculty/${facultyId}/edit`}>
            <Button variant="outline">Edit Faculty</Button>
          </Link>
          <Button variant="destructive">Deactivate</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
              <User className="text-primary h-12 w-12" />
            </div>
            <CardTitle className="text-2xl">
              {faculty.user.firstName} {faculty.user.lastName}
            </CardTitle>
            <p className="text-muted-foreground">{faculty.teacherCode}</p>
            <div className="mt-2">
              <Badge variant={faculty.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {faculty.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="text-muted-foreground mr-2 h-4 w-4" />
                {faculty.user.email}
              </div>
              <div className="flex items-center text-sm">
                <Building className="text-muted-foreground mr-2 h-4 w-4" />
                {faculty.department?.name || 'No Department'}
              </div>
              <div className="flex items-center text-sm">
                <Briefcase className="text-muted-foreground mr-2 h-4 w-4" />
                <span className="capitalize">{faculty.employmentType.toLowerCase()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">Class Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 border-t pt-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs uppercase">
                          First Name
                        </label>
                        <p className="font-medium">{faculty.user.firstName}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs uppercase">Last Name</label>
                        <p className="font-medium">{faculty.user.lastName}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs uppercase">
                          Email Address
                        </label>
                        <p className="font-medium">{faculty.user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs uppercase">
                          Teacher Code
                        </label>
                        <p className="font-medium">{faculty.teacherCode}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="mb-4 text-lg font-medium">Employment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs uppercase">
                          Department
                        </label>
                        <p className="font-medium">{faculty.department?.name || 'Unassigned'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs uppercase">
                          Employment Type
                        </label>
                        <p className="font-medium capitalize">
                          {faculty.employmentType.toLowerCase()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-muted-foreground text-xs uppercase">Status</label>
                        <p className="font-medium">{faculty.status}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignments">
              <FacultyAssignments facultyId={facultyId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
