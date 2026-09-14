'use client';

import { use, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useAdminFacultyDetails,
  useFacultyAssignments,
  useAssignFacultyClass,
} from '@/hooks/api/admin/useFaculty';
import { useAdminDeleteCourseAssignment } from '@/hooks/api/admin/useCourseAssignments';
import {
  useAdminFacultySectionsByFaculty,
  useAdminCreateFacultySection,
  useAdminDeleteFacultySection,
} from '@/hooks/api/admin/useFacultySections';
import { useAdminRoles } from '@/hooks/api/admin/useRoles';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Checkbox,
} from '@student-erp/ui';
import {
  ArrowLeft,
  User,
  Building,
  Briefcase,
  Mail,
  Trash2,
  Plus,
  Users,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { useAdminCourses } from '@/hooks/api/admin/useCourses';
import { useAdminSections } from '@/hooks/api/admin/useSections';

function FacultyAssignments({ facultyId }: { facultyId: string }) {
  // Course Assignments hooks
  const { data: assignments, isLoading: isLoadingAssignments } = useFacultyAssignments(facultyId);
  const { data: coursesRes } = useAdminCourses(1, 100);
  const { data: sectionsRes } = useAdminSections(1, 100);
  const deleteAssignment = useAdminDeleteCourseAssignment();
  const assignClass = useAssignFacultyClass();

  // Faculty Section Roles hooks
  const { data: facultySections, isLoading: isLoadingFacultySections } =
    useAdminFacultySectionsByFaculty(facultyId);
  const { data: customRoles } = useAdminRoles();
  const createFacultySection = useAdminCreateFacultySection();
  const deleteFacultySection = useAdminDeleteFacultySection();

  const courses = coursesRes?.data || [];
  const sections = sectionsRes?.data || [];

  // Form states for Course Assignment
  const [courseId, setCourseId] = useState('');
  const [courseSectionId, setCourseSectionId] = useState('');
  const [assignCourseError, setAssignCourseError] = useState<string | null>(null);

  // Form states for Section Role Assignment
  const [roleSectionId, setRoleSectionId] = useState('');
  const [selectedRole, setSelectedRole] = useState('TEACHER');
  const [isPrimaryTeacher, setIsPrimaryTeacher] = useState(false);
  const [assignRoleError, setAssignRoleError] = useState<string | null>(null);

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignCourseError(null);

    if (!courseId || !courseSectionId) {
      setAssignCourseError('Please select both a course and a section.');
      return;
    }

    try {
      await assignClass.mutateAsync({
        id: facultyId,
        data: { courseId, sectionId: courseSectionId },
      });
      toast.success('Course assigned to faculty successfully');
      setCourseId('');
      setCourseSectionId('');
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to assign course to faculty.';
      setAssignCourseError(message);
      toast.error(message);
    }
  };

  const handleAssignSectionRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignRoleError(null);

    if (!roleSectionId) {
      setAssignRoleError('Please select a section.');
      return;
    }

    const chosenSection = sections.find((s) => s.id === roleSectionId);
    const academicYearId = chosenSection?.academicYear?.id;

    if (!academicYearId) {
      const msg = 'The selected section does not have an associated academic year.';
      setAssignRoleError(msg);
      toast.error(msg);
      return;
    }

    try {
      await createFacultySection.mutateAsync({
        facultyId,
        sectionId: roleSectionId,
        role: selectedRole,
        academicYearId,
        isPrimary: isPrimaryTeacher,
      });
      toast.success('Section role assigned successfully');
      setRoleSectionId('');
      setSelectedRole('TEACHER');
      setIsPrimaryTeacher(false);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to assign section role.';
      setAssignRoleError(message);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Section Roles (Class Teacher / Custom Roles) */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Section & Role Assignment
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Assign this faculty member to a section as a Class Teacher, Teacher, or custom role.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignRoleError && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {assignRoleError}
              </div>
            )}
            <form onSubmit={handleAssignSectionRole} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Section</label>
                  <select
                    required
                    value={roleSectionId}
                    onChange={(e) => setRoleSectionId(e.target.value)}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={createFacultySection.isPending}
                  >
                    <option value="">Select Section...</option>
                    {sections.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}){s.academicYear?.name ? ` - ${s.academicYear.name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    required
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={createFacultySection.isPending}
                  >
                    <optgroup label="Standard Roles">
                      <option value="CLASS_TEACHER">Class Teacher</option>
                      <option value="TEACHER">Teacher</option>
                    </optgroup>
                    {customRoles && customRoles.length > 0 && (
                      <optgroup label="Custom Roles">
                        {customRoles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center space-x-2 text-sm font-normal">
                  <Checkbox
                    id="is-primary-section"
                    checked={isPrimaryTeacher}
                    onCheckedChange={(checked) => setIsPrimaryTeacher(Boolean(checked))}
                    disabled={createFacultySection.isPending}
                  />
                  <span>Primary Section In-Charge / Class Teacher</span>
                </label>

                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={createFacultySection.isPending || !roleSectionId}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createFacultySection.isPending ? 'Assigning...' : 'Assign Section Role'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Section Roles List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Sections & Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingFacultySections ? (
              <p className="text-muted-foreground py-4 text-center">Loading section roles...</p>
            ) : !facultySections || facultySections.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">No section roles assigned.</p>
            ) : (
              <div className="space-y-3">
                {facultySections.map((fs: any) => (
                  <div
                    key={fs.id}
                    className="border-border flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{fs.section?.name || 'Section'}</span>
                        {fs.section?.code && (
                          <span className="text-muted-foreground text-sm">({fs.section.code})</span>
                        )}
                        <Badge variant={fs.role === 'CLASS_TEACHER' ? 'default' : 'secondary'}>
                          {fs.role.replace('_', ' ')}
                        </Badge>
                        {fs.isPrimary && (
                          <Badge variant="outline" className="border-primary text-primary">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Academic Year: {fs.academicYear?.name || 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8 w-8 p-0"
                        title="Remove Section Role"
                        disabled={deleteFacultySection.isPending}
                        onClick={async () => {
                          const secName = fs.section?.name || 'this section';
                          if (confirm(`Remove ${fs.role} role for ${secName}?`)) {
                            try {
                              await deleteFacultySection.mutateAsync(fs.id);
                              toast.success('Section role removed');
                            } catch (err: any) {
                              toast.error(
                                err.response?.data?.message || 'Failed to remove section role',
                              );
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. Course Teaching Assignments */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              Course Teaching Assignments
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Assign courses to be taught by this faculty in specific sections.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignCourseError && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {assignCourseError}
              </div>
            )}
            <form onSubmit={handleAssignCourse} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={assignClass.isPending}
                  >
                    <option value="">Select Course...</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Section</label>
                  <select
                    required
                    value={courseSectionId}
                    onChange={(e) => setCourseSectionId(e.target.value)}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={assignClass.isPending}
                  >
                    <option value="">Select Section...</option>
                    {sections.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}){s.academicYear?.name ? ` - ${s.academicYear.name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={assignClass.isPending || !courseId || !courseSectionId}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {assignClass.isPending ? 'Assigning...' : 'Assign Course'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Course Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Course Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAssignments ? (
              <p className="text-muted-foreground py-4 text-center">
                Loading course assignments...
              </p>
            ) : !assignments || assignments.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center">No courses assigned.</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="border-border flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <h4 className="font-semibold">
                        {assignment.course?.name || assignment.courseId}
                        {assignment.course?.code && (
                          <span className="text-muted-foreground ml-2 text-sm font-normal">
                            ({assignment.course.code})
                          </span>
                        )}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Section: {assignment.section?.name || assignment.sectionId}
                        {assignment.term?.name
                          ? ` | Term: ${assignment.term.name}`
                          : assignment.academicTerm?.name
                            ? ` | Term: ${assignment.academicTerm.name}`
                            : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Teaching</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8 w-8 p-0"
                        title="Remove Assignment"
                        disabled={deleteAssignment.isPending}
                        onClick={async () => {
                          const courseName = assignment.course?.name || 'this course';
                          const sectionName = assignment.section?.name || 'section';
                          if (confirm(`Remove assignment for ${courseName} (${sectionName})?`)) {
                            try {
                              await deleteAssignment.mutateAsync(assignment.id);
                              toast.success('Course assignment removed');
                            } catch (err: any) {
                              toast.error(
                                err.response?.data?.message || 'Failed to remove assignment',
                              );
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FacultyDetailsPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { facultyId } = use(params);
  const { data: faculty, isLoading, error } = useAdminFacultyDetails(facultyId);

  const initialTab = searchParams.get('tab') === 'assignments' ? 'assignments' : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
