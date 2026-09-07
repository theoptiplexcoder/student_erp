'use client';
import { use, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  Input,
} from '@student-erp/ui';
import {
  ArrowLeft,
  MapPin,
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminSection, CourseAssignment } from '@/hooks/api/admin/useSections';
import { useAdminFaculty } from '@/hooks/api/admin/useFaculty';
import { useAdminCourses, Course } from '@/hooks/api/admin/useCourses';
import { useAcademicTerms } from '@/hooks/api/admin/useAcademicTerms';
import { useAdminDeleteCourseAssignment } from '@/hooks/api/admin/useCourseAssignments';
import { AssignCourseFacultyModal } from '@/components/admin/sections/AssignCourseFacultyModal';
import {
  useAdminFacultySectionsBySection,
  useAdminUnassignedFaculty,
  useAdminCreateFacultySection,
  useAdminDeleteFacultySection,
} from '@/hooks/api/admin/useFacultySections';
import { useAdminRoles } from '@/hooks/api/admin/useRoles';
import { Trash2, ShieldCheck, UserCheck } from 'lucide-react';

// Aggregate faculty from course assignments into a unique map keyed by faculty ID
function aggregateFaculty(assignments: CourseAssignment[] | undefined) {
  const facultyMap = new Map<
    string,
    { faculty: CourseAssignment['faculty']; courses: CourseAssignment['course'][] }
  >();

  if (!assignments)
    return { list: [], departmentSet: new Set<string>(), courseCount: new Set<string>() };

  const departmentSet = new Set<string>();
  const courseCount = new Set<string>();

  for (const assignment of assignments) {
    if (!assignment.faculty) continue;
    const fid = assignment.faculty.id;
    const deptName = assignment.faculty.department?.name;
    if (deptName) departmentSet.add(deptName);
    if (assignment.course) courseCount.add(assignment.course.id);

    const existing = facultyMap.get(fid);
    if (existing) {
      existing.courses.push(assignment.course);
    } else {
      facultyMap.set(fid, { faculty: assignment.faculty, courses: [assignment.course] });
    }
  }

  return {
    list: Array.from(facultyMap.values()),
    departmentSet,
    courseCount,
  };
}

export default function SectionDetailPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = use(params);
  const { data: section, isLoading, isError, error } = useAdminSection(sectionId);

  const { data: facultyData } = useAdminFaculty(1, 100);
  const { data: coursesData } = useAdminCourses(1, 100);
  const { data: termsData } = useAcademicTerms(section?.academicYear?.id || '');
  const deleteAssignment = useAdminDeleteCourseAssignment();

  // Modal state for assigning faculty to course
  const [modalCourse, setModalCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCourseAssignment, setActiveCourseAssignment] = useState<any | null>(null);

  const handleOpenAssignModal = (course: Course, currentAssignment?: any) => {
    setModalCourse(course);
    setActiveCourseAssignment(currentAssignment || null);
    setIsModalOpen(true);
  };

  // Section-level Faculty & Roles state and hooks
  const academicYearId = section?.academicYear?.id || '';
  const { data: sectionFacultyList = [], isLoading: isLoadingSectionFaculty } =
    useAdminFacultySectionsBySection(sectionId, academicYearId);
  const { data: unassignedFaculty = [], isLoading: isLoadingUnassigned } =
    useAdminUnassignedFaculty(sectionId, academicYearId);
  const { data: customRoles = [] } = useAdminRoles();
  const createSectionFaculty = useAdminCreateFacultySection();
  const deleteSectionFaculty = useAdminDeleteFacultySection();

  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [roleForm, setRoleForm] = useState({
    facultyId: '',
    role: 'TEACHER',
    isPrimary: false,
  });

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.facultyId || !roleForm.role) {
      alert('Please select both a faculty member and a role.');
      return;
    }
    if (!academicYearId) {
      alert('This section has no academic year associated.');
      return;
    }

    try {
      await createSectionFaculty.mutateAsync({
        facultyId: roleForm.facultyId,
        sectionId,
        role: roleForm.role,
        academicYearId,
        isPrimary: roleForm.isPrimary,
      });
      setRoleForm({ facultyId: '', role: 'TEACHER', isPrimary: false });
      setIsAssigningRole(false);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to assign faculty to section');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !section) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/academics/sections"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-muted-foreground text-sm">Academics / Sections</span>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-lg font-medium">Failed to load section</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error
                ? error.message
                : 'Section not found or you do not have access to it.'}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/admin/academics/sections">Back to Sections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    list: facultyList,
    departmentSet,
    courseCount,
  } = aggregateFaculty(section.courseAssignments);
  const studentCount = section._count?.students ?? 0;
  const facultyCount = facultyList.length;

  // Map existing course assignments by course ID for fast lookup
  const assignmentByCourseId = new Map<string, CourseAssignment>();
  if (section.courseAssignments) {
    for (const ca of section.courseAssignments) {
      if (ca.course?.id) {
        assignmentByCourseId.set(ca.course.id, ca);
      }
    }
  }

  // Derive all applicable courses for this section
  // 1. Courses already having an assignment in this section
  // 2. Plus courses belonging to the same program or from the courses list
  const sectionCourses: Course[] = (() => {
    const courseMap = new Map<string, Course>();

    // First add courses from existing assignments
    if (section.courseAssignments) {
      for (const ca of section.courseAssignments) {
        if (ca.course?.id) {
          courseMap.set(ca.course.id, {
            id: ca.course.id,
            code: ca.course.code,
            name: ca.course.name,
            creditValue: ca.course.creditValue ?? undefined,
            credits: ca.course.creditValue ?? 0,
            status: 'ACTIVE',
            department: ca.faculty?.department
              ? {
                  id: ca.faculty.department.id,
                  name: ca.faculty.department.name,
                }
              : undefined,
          });
        }
      }
    }

    // Next add program-level or general courses from coursesData
    if (coursesData?.data) {
      for (const c of coursesData.data) {
        // If section has a program, prioritize courses matching that program or add to list
        if (section.program?.id && c.program?.id) {
          if (c.program.id === section.program.id) {
            courseMap.set(c.id, {
              ...c,
              ...(courseMap.get(c.id) || {}),
              department: c.department || courseMap.get(c.id)?.department,
            });
          }
        } else if (!courseMap.has(c.id) && courseMap.size < 12) {
          // If no program match is strictly required, supply existing courses
          courseMap.set(c.id, c);
        }
      }
    }

    return Array.from(courseMap.values());
  })();

  const unassignedCount = sectionCourses.filter((c) => !assignmentByCourseId.has(c.id)).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/academics/sections"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-muted-foreground text-sm">Academics / Sections / {section.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{section.name}</h1>
          <p className="text-muted-foreground">
            Section Code: <strong>{section.code}</strong>
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty</CardTitle>
            <GraduationCap className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facultyCount}</div>
            <p className="text-muted-foreground text-xs">
              {facultyCount === 1 ? 'faculty member' : 'faculty members'} assigned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseCount.size}</div>
            <p className="text-muted-foreground text-xs">
              {courseCount.size === 1 ? 'course' : 'courses'} offered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount}</div>
            <p className="text-muted-foreground text-xs">out of {section.capacity} capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <MapPin className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentSet.size}</div>
            <p className="text-muted-foreground text-xs">
              {departmentSet.size === 1 ? 'department' : 'departments'} represented
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section details card */}
      <Card>
        <CardHeader>
          <CardTitle>Section Information</CardTitle>
          <CardDescription>Core details for this section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <span className="text-sm font-medium">Section Name</span>
              <p className="text-muted-foreground text-sm">{section.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Section Code</span>
              <p className="text-muted-foreground text-sm">{section.code}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Capacity</span>
              <p className="text-muted-foreground text-sm">{section.capacity} students</p>
            </div>
            {section.semester != null && (
              <div>
                <span className="text-sm font-medium">Semester</span>
                <p className="text-muted-foreground text-sm">Semester {section.semester}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium">Program</span>
              <p className="text-muted-foreground text-sm">
                {section.program?.name || 'Not assigned'}
              </p>
            </div>
            {section.batch && (
              <div>
                <span className="text-sm font-medium">Batch</span>
                <p className="text-muted-foreground text-sm">{section.batch.name}</p>
              </div>
            )}
            {section.classLevel && (
              <div>
                <span className="text-sm font-medium">Class Level</span>
                <p className="text-muted-foreground text-sm">{section.classLevel.name}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium">Academic Year</span>
              <p className="text-muted-foreground text-sm">
                {section.academicYear?.name || 'Not assigned'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Enrolled Students</span>
              <p className="text-muted-foreground text-sm">
                {studentCount} / {section.capacity}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Offerings & Faculty Assignments card */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Course Offerings & Faculty Assignments</CardTitle>
              {unassignedCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  {unassignedCount} Unassigned
                </Badge>
              )}
            </div>
            <CardDescription>
              Courses associated with this section and their assigned faculty teachers.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <BookOpen className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-lg font-medium">No courses found</p>
              <p className="text-muted-foreground text-sm">
                No courses are currently associated with this program or section.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sectionCourses.map((c) => {
                const assignment = assignmentByCourseId.get(c.id);
                const hasFaculty = Boolean(assignment?.faculty);

                return (
                  <div
                    key={c.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      !hasFaculty
                        ? 'border-amber-500/40 bg-amber-500/5 dark:border-amber-500/30 dark:bg-amber-500/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      {/* Left: Course details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground font-semibold">{c.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {c.code}
                          </Badge>
                          {c.creditValue != null && (
                            <span className="text-muted-foreground text-xs">
                              ({c.creditValue} credits)
                            </span>
                          )}
                          {!hasFaculty && (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 border-amber-500/50 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-400"
                            >
                              <AlertCircle className="h-3 w-3" />
                              Faculty Assignment Needed
                            </Badge>
                          )}
                        </div>

                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                          {c.department?.name ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Dept: {c.department.name}
                            </span>
                          ) : (
                            <span>Dept: Not assigned</span>
                          )}
                          {c.program?.name && <span>• Program: {c.program.name}</span>}
                        </div>
                      </div>

                      {/* Right: Assigned Faculty or Assign Action */}
                      <div className="flex flex-wrap items-center gap-3">
                        {hasFaculty && assignment ? (
                          <div className="flex items-center gap-3">
                            <div className="text-left md:text-right">
                              <p className="text-foreground text-sm font-medium">
                                {assignment.faculty.user.firstName}{' '}
                                {assignment.faculty.user.lastName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Code: {assignment.faculty.teacherCode}
                                {assignment.faculty.department?.name
                                  ? ` • ${assignment.faculty.department.name}`
                                  : ''}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenAssignModal(c, assignment)}
                            >
                              Change
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive h-8 w-8 p-0"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Remove ${assignment.faculty.user.firstName} ${assignment.faculty.user.lastName} from teaching ${c.name}?`,
                                  )
                                ) {
                                  deleteAssignment.mutate(assignment.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-1.5 bg-amber-600 text-white hover:bg-amber-700"
                            onClick={() => handleOpenAssignModal(c)}
                          >
                            <Plus className="h-4 w-4" />
                            Assign Faculty
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faculty & Roles Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Faculty & Roles</CardTitle>
            <CardDescription>
              Faculty members assigned directly to this section (Class Teachers, Teachers, and
              Custom Roles)
            </CardDescription>
          </div>
          <Button onClick={() => setIsAssigningRole(!isAssigningRole)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Assign Role
          </Button>
        </CardHeader>
        <CardContent>
          {isAssigningRole && (
            <div className="bg-muted/50 mb-6 rounded-md border p-4">
              <h3 className="mb-3 font-semibold">Assign Faculty to Section Role</h3>
              <form onSubmit={handleAssignRole} className="flex flex-wrap items-end gap-4">
                <div className="min-w-[200px] flex-1 space-y-2">
                  <label className="text-sm font-medium">Faculty Member</label>
                  <select
                    required
                    className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    value={roleForm.facultyId}
                    onChange={(e) =>
                      setRoleForm((prev) => ({ ...prev, facultyId: e.target.value }))
                    }
                    disabled={createSectionFaculty.isPending || isLoadingUnassigned}
                  >
                    <option value="">Select Faculty...</option>
                    {unassignedFaculty.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.user?.firstName} {f.user?.lastName} ({f.teacherCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[200px] flex-1 space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    required
                    className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    value={roleForm.role}
                    onChange={(e) => setRoleForm((prev) => ({ ...prev, role: e.target.value }))}
                    disabled={createSectionFaculty.isPending}
                  >
                    <optgroup label="Built-in Roles">
                      <option value="TEACHER">Teacher</option>
                      <option value="CLASS_TEACHER">Class Teacher</option>
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
                <div className="flex h-10 items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="section-is-primary"
                    className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                    checked={roleForm.isPrimary}
                    onChange={(e) =>
                      setRoleForm((prev) => ({ ...prev, isPrimary: e.target.checked }))
                    }
                    disabled={createSectionFaculty.isPending}
                  />
                  <label
                    htmlFor="section-is-primary"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Primary Class Teacher
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={createSectionFaculty.isPending || !roleForm.facultyId}
                  className="bg-admin-primary text-admin-primary-foreground min-w-[150px]"
                >
                  {createSectionFaculty.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Save Role'
                  )}
                </Button>
              </form>
            </div>
          )}

          {isLoadingSectionFaculty ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              Loading faculty roles...
            </div>
          ) : sectionFacultyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <UserCheck className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-lg font-medium">No faculty roles assigned</p>
              <p className="text-muted-foreground text-sm">
                No class teacher or section roles assigned yet.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {sectionFacultyList.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
                      <GraduationCap className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {assignment.faculty.user.firstName} {assignment.faculty.user.lastName}
                        </span>
                        <Badge
                          variant={
                            assignment.role === 'CLASS_TEACHER'
                              ? 'default'
                              : assignment.role === 'TEACHER'
                                ? 'outline'
                                : 'secondary'
                          }
                          className="text-xs capitalize"
                        >
                          {assignment.role.replace('_', ' ').toLowerCase()}
                        </Badge>
                        {assignment.isPrimary && (
                          <Badge
                            variant="default"
                            className="bg-emerald-600 text-xs hover:bg-emerald-700"
                          >
                            <ShieldCheck className="mr-1 h-3 w-3" /> Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground flex items-center gap-2 text-xs">
                        <span>Code: {assignment.faculty.teacherCode}</span>
                        <span>•</span>
                        <span>{assignment.faculty.user.email}</span>
                        {assignment.faculty.department?.name && (
                          <>
                            <span>•</span>
                            <span>{assignment.faculty.department.name}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 h-8 px-2"
                      disabled={deleteSectionFaculty.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            `Remove role ${assignment.role} for ${assignment.faculty.user.firstName} ${assignment.faculty.user.lastName}?`,
                          )
                        ) {
                          deleteSectionFaculty.mutate(assignment.id);
                        }
                      }}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Faculty to Course Modal */}
      {section && (
        <AssignCourseFacultyModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalCourse(null);
            setActiveCourseAssignment(null);
          }}
          section={{
            id: section.id,
            name: section.name,
            code: section.code,
          }}
          course={modalCourse}
          availableTerms={termsData || []}
          currentAssignment={activeCourseAssignment}
        />
      )}
    </div>
  );
}
