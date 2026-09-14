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

  // Unified Form state
  const [sectionId, setSectionId] = useState('');
  const [role, setRole] = useState('CLASS_TEACHER');
  const [isPrimary, setIsPrimary] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = createFacultySection.isPending || assignClass.isPending;
  const isLoading = isLoadingAssignments || isLoadingFacultySections;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!sectionId) {
      setFormError('Please select a section.');
      return;
    }

    const chosenSection = sections.find((s) => s.id === sectionId);
    const academicYearId = chosenSection?.academicYear?.id;

    if (!academicYearId) {
      const msg = 'The selected section does not have an associated academic year.';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      // 1. Assign Section Role (e.g. Class Teacher, Teacher, Custom Role)
      await createFacultySection.mutateAsync({
        facultyId,
        sectionId,
        role,
        academicYearId,
        isPrimary,
      });

      // 2. If a course is also selected, assign Course to Section
      if (courseId) {
        await assignClass.mutateAsync({
          id: facultyId,
          data: { courseId, sectionId, isPrimary },
        });
      }

      toast.success(
        courseId
          ? 'Section role and course assigned successfully'
          : 'Section role assigned successfully',
      );

      // Reset form
      setSectionId('');
      setCourseId('');
      setRole('CLASS_TEACHER');
      setIsPrimary(false);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to complete assignment.';
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Unified Assignment Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Assign Section & Course
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Assign this faculty member to a section with a role (e.g., Class Teacher, Teacher, or
            custom role) and optional course assignment.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {formError && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Section <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="">Select Section...</option>
                  {sections.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}){s.academicYear?.name ? ` - ${s.academicYear.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Section Role <span className="text-destructive">*</span>
                </label>
                <select
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <optgroup label="Standard Roles">
                    <option value="CLASS_TEACHER">Class Teacher</option>
                    <option value="TEACHER">Teacher</option>
                  </optgroup>
                  {customRoles && customRoles.length > 0 && (
                    <optgroup label="Custom Roles">
                      {customRoles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Course (Optional) */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium">
                  Course{' '}
                  <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="">Select Course (or leave empty)...</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center space-x-2 text-sm font-normal">
                <Checkbox
                  id="is-primary-assignment"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(Boolean(checked))}
                  disabled={isSubmitting}
                />
                <span>Primary Section In-Charge / Class Teacher</span>
              </label>

              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting || !sectionId}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Assigning...' : 'Assign to Section'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Assignments (Merged Section Roles & Course Assignments) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Section & Course Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-4 text-center">Loading assignments...</p>
          ) : (!facultySections || facultySections.length === 0) &&
            (!assignments || assignments.length === 0) ? (
            <p className="text-muted-foreground py-4 text-center">No assignments found.</p>
          ) : (
            <div className="space-y-3">
              {/* Section Roles */}
              {facultySections?.map((fs: any) => (
                <div
                  key={`section-role-${fs.id}`}
                  className="border-border flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
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

              {/* Course Teaching Assignments */}
              {assignments?.map((assignment: any) => (
                <div
                  key={`course-assign-${assignment.id}`}
                  className="border-border flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <BookOpen className="text-muted-foreground h-4 w-4" />
                      <span className="font-semibold">
                        {assignment.course?.name || assignment.courseId}
                      </span>
                      {assignment.course?.code && (
                        <span className="text-muted-foreground text-sm">
                          ({assignment.course.code})
                        </span>
                      )}
                      <Badge variant="outline">Course Teacher</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Section: {assignment.section?.name || assignment.sectionId}
                      {assignment.term?.name
                        ? ` | Term: ${assignment.term.name}`
                        : assignment.academicTerm?.name
                          ? ` | Term: ${assignment.academicTerm.name}`
                          : ''}
                    </p>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive h-8 w-8 p-0"
                      title="Remove Course Assignment"
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
