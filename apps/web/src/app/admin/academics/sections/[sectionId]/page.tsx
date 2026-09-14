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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminSection, CourseAssignment } from '@/hooks/api/admin/useSections';
import type { Course } from '@/hooks/api/admin/useCourses';
import { useAcademicTerms } from '@/hooks/api/admin/useAcademicTerms';
import {
  useAdminCurriculumsByProgram,
  useAdminAllCurriculums,
} from '@/hooks/api/admin/useCurriculums';
import { useAdminPrograms, Program } from '@/hooks/api/admin/usePrograms';
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

  // Program selection for course offerings view navigation
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');

  // Fetch all programs for program-wise navigation tabs
  const { data: programsData, isLoading: isLoadingPrograms } = useAdminPrograms(1, 100);
  const allPrograms: Program[] = programsData?.data || [];

  // Fetch all curriculums (for other programs view) and program-specific curriculums
  const { data: programCurriculums = [], isLoading: isLoadingProgramCurriculums } =
    useAdminCurriculumsByProgram(section?.program?.id || '');
  const { data: allCurriculums = [], isLoading: isLoadingAllCurriculums } =
    useAdminAllCurriculums();

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

  // Derive section-specific courses:
  // 1. First from section.courseOfferings (exact courses mapped to this section)
  // 2. Supplemented by any existing section.courseAssignments
  const sectionCourses: Course[] = (() => {
    const courseMap = new Map<string, Course>();

    // Add section-specific course offerings
    if (section.courseOfferings) {
      for (const offering of section.courseOfferings) {
        if (offering.course) {
          courseMap.set(offering.course.id, {
            id: offering.course.id,
            code: offering.course.code,
            name: offering.course.name,
            creditValue: offering.course.creditValue ?? undefined,
            credits: offering.course.creditValue ?? 0,
            status: 'ACTIVE',
            department: offering.course.department
              ? {
                  id: offering.course.department.id,
                  name: offering.course.department.name,
                }
              : undefined,
          });
        }
      }
    }

    // Add courses from existing course assignments if not already present
    if (section.courseAssignments) {
      for (const ca of section.courseAssignments) {
        if (ca.course?.id && !courseMap.has(ca.course.id)) {
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

      {/* Course Offerings, Enrolled Curriculum & Program Exploration */}
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Course Offerings</CardTitle>
                {unassignedCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {unassignedCount} Unassigned
                  </Badge>
                )}
              </div>
              <CardDescription>
                Explore enrolled curriculum courses, current program offerings, and other program
                curricula.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="section-offerings" className="w-full">
            <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 p-1">
              <TabsTrigger value="section-offerings" className="text-xs sm:text-sm">
                Section Offerings ({sectionCourses.length})
              </TabsTrigger>
              <TabsTrigger value="enrolled-curriculum" className="text-xs sm:text-sm">
                Enrolled Curriculum
              </TabsTrigger>
              <TabsTrigger value="program-curricula" className="text-xs sm:text-sm">
                {section.program?.code
                  ? `${section.program.code} Program Courses`
                  : 'Program Courses'}
              </TabsTrigger>
              <TabsTrigger value="other-programs" className="text-xs sm:text-sm">
                Other Programs (View Only)
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Current Section Course Offerings with Faculty Assignment */}
            <TabsContent value="section-offerings" className="space-y-4">
              <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Active Section Offerings</h4>
                  <p className="text-muted-foreground text-xs">
                    Courses offered specifically for this section with faculty assignment
                    management.
                  </p>
                </div>
                <div className="text-muted-foreground text-xs">
                  {sectionCourses.length} course{sectionCourses.length === 1 ? '' : 's'} •{' '}
                  {sectionCourses.length - unassignedCount} assigned
                </div>
              </div>

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
            </TabsContent>

            {/* TAB 2: Enrolled Curriculum */}
            <TabsContent value="enrolled-curriculum" className="space-y-4">
              <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Enrolled Curriculum Structure</h4>
                  <p className="text-muted-foreground text-xs">
                    Curriculum active for {section.program?.name || 'this program'}{' '}
                    {section.semester != null ? `• Filtered by Semester ${section.semester}` : ''}
                  </p>
                </div>
                {section.program?.id && (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/admin/academics/programs/${section.program.id}`}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Program
                    </Link>
                  </Button>
                )}
              </div>

              {isLoadingProgramCurriculums ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading enrolled curriculum...
                </div>
              ) : programCurriculums.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <BookOpen className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-lg font-medium">No active curriculum found</p>
                  <p className="text-muted-foreground text-sm">
                    There are no curriculums registered under{' '}
                    {section.program?.name || 'this program'}.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {programCurriculums.map((curr: any) => {
                    // Match current section semester if available, else show all terms
                    const relevantTerms =
                      section.semester != null && curr.curriculumTerms?.length
                        ? curr.curriculumTerms.filter(
                            (t: any) =>
                              t.sequence === section.semester ||
                              t.name?.toLowerCase().includes(`semester ${section.semester}`) ||
                              t.name?.toLowerCase().includes(`term ${section.semester}`),
                          )
                        : curr.curriculumTerms || [];

                    const displayTerms =
                      relevantTerms.length > 0 ? relevantTerms : curr.curriculumTerms || [];

                    return (
                      <div key={curr.id} className="space-y-4 rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-foreground font-semibold">{curr.name}</h5>
                              <Badge variant="secondary" className="text-xs">
                                {curr.versionNumber}
                              </Badge>
                              <Badge
                                variant={curr.status === 'ACTIVE' ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {curr.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              Effective from:{' '}
                              {curr.effectiveFrom
                                ? new Date(curr.effectiveFrom).toLocaleDateString()
                                : 'N/A'}
                            </p>
                          </div>
                          {section.program?.id && (
                            <Button asChild variant="ghost" size="sm">
                              <Link
                                href={`/admin/academics/programs/${section.program.id}/curriculums/${curr.id}`}
                                className="flex items-center gap-1 text-xs"
                              >
                                <Eye className="h-3.5 w-3.5" /> Full Curriculum View
                              </Link>
                            </Button>
                          )}
                        </div>

                        {displayTerms.length === 0 ? (
                          <div className="text-muted-foreground py-2 text-xs">
                            No terms configured in this curriculum.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {displayTerms.map((term: any) => {
                              const coursesList = term.curriculumCourses || [];
                              return (
                                <div
                                  key={term.id}
                                  className="bg-muted/20 space-y-2 rounded-md border p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                      {term.name} (Sequence: {term.sequence})
                                    </span>
                                    {term.creditRequirement != null && (
                                      <span className="text-muted-foreground text-xs">
                                        Required Credits: {term.creditRequirement}
                                      </span>
                                    )}
                                  </div>

                                  {coursesList.length === 0 ? (
                                    <p className="text-muted-foreground text-xs italic">
                                      No courses listed under this term.
                                    </p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-28 text-xs">Code</TableHead>
                                            <TableHead className="text-xs">Course Name</TableHead>
                                            <TableHead className="w-20 text-xs">Credits</TableHead>
                                            <TableHead className="w-24 text-xs">Type</TableHead>
                                            <TableHead className="text-xs">Department</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {coursesList.map((cc: any) => {
                                            const courseObj = cc.course || cc;
                                            return (
                                              <TableRow key={cc.id || courseObj.id}>
                                                <TableCell className="font-mono text-xs font-medium">
                                                  {courseObj.code}
                                                </TableCell>
                                                <TableCell className="text-xs font-medium">
                                                  {courseObj.name}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                  {cc.creditValue ?? courseObj.creditValue ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                  <Badge
                                                    variant={cc.isMandatory ? 'default' : 'outline'}
                                                    className="px-1.5 py-0 text-[10px]"
                                                  >
                                                    {cc.isMandatory ? 'Mandatory' : 'Elective'}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                  {courseObj.department?.name || '-'}
                                                </TableCell>
                                              </TableRow>
                                            );
                                          })}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: Courses According to Current Program */}
            <TabsContent value="program-curricula" className="space-y-4">
              <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold">
                    Current Program Course Offerings ({section.program?.name || 'Assigned Program'})
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    All courses configured across the curriculum and terms for{' '}
                    {section.program?.code || 'this program'}.
                  </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs">
                  {section.program?.code || 'PROGRAM'}
                </Badge>
              </div>

              {isLoadingProgramCurriculums ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading program courses...
                </div>
              ) : programCurriculums.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <BookOpen className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-lg font-medium">No program curriculums found</p>
                  <p className="text-muted-foreground text-sm">
                    No curriculum data has been created for{' '}
                    {section.program?.name || 'this program'} yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programCurriculums.map((curr: any) => (
                    <div key={curr.id} className="space-y-4 rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold">{curr.name}</h5>
                          <Badge variant="secondary" className="text-xs">
                            {curr.versionNumber}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {curr.curriculumTerms?.length || 0} Terms
                        </span>
                      </div>

                      <div className="space-y-3">
                        {curr.curriculumTerms?.map((term: any) => {
                          const coursesList = term.curriculumCourses || [];
                          return (
                            <div key={term.id} className="bg-muted/10 space-y-2 rounded border p-3">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span>{term.name}</span>
                                <span className="text-muted-foreground font-normal">
                                  {coursesList.length} course{coursesList.length === 1 ? '' : 's'}
                                </span>
                              </div>
                              {coursesList.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-24 text-xs">Code</TableHead>
                                        <TableHead className="text-xs">Course Name</TableHead>
                                        <TableHead className="w-20 text-xs">Credits</TableHead>
                                        <TableHead className="w-24 text-xs">Type</TableHead>
                                        <TableHead className="text-xs">Department</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {coursesList.map((cc: any) => {
                                        const cObj = cc.course || cc;
                                        return (
                                          <TableRow key={cc.id || cObj.id}>
                                            <TableCell className="font-mono text-xs font-medium">
                                              {cObj.code}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium">
                                              {cObj.name}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                              {cc.creditValue ?? cObj.creditValue ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                              <Badge
                                                variant={cc.isMandatory ? 'default' : 'outline'}
                                                className="px-1.5 py-0 text-[10px]"
                                              >
                                                {cc.isMandatory ? 'Mandatory' : 'Elective'}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                              {cObj.department?.name || '-'}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-xs italic">
                                  No courses in this term.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 4: Other Programs in Curriculum (View Only) */}
            <TabsContent value="other-programs" className="space-y-4">
              <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">Other Program Curricula</h4>
                    <Badge variant="outline" className="text-muted-foreground text-xs">
                      View Only
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Browse courses and curriculum structures offered across other degree programs.
                  </p>
                </div>
              </div>

              {/* Program Navigation Bar / Tabs */}
              {isLoadingPrograms ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-center text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading programs...
                </div>
              ) : allPrograms.length <= 1 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  No other programs available to display.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Horizontal program selector navigation */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      Select Program:
                    </span>
                    {allPrograms
                      .filter((p) => p.id !== section.program?.id)
                      .map((prog) => {
                        const isSelected =
                          (selectedProgramId ||
                            allPrograms.filter((p) => p.id !== section.program?.id)[0]?.id) ===
                          prog.id;
                        return (
                          <Button
                            key={prog.id}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedProgramId(prog.id)}
                            className="h-7 px-2.5 text-xs"
                          >
                            {prog.name} ({prog.code})
                          </Button>
                        );
                      })}
                  </div>

                  {/* Curriculums for the selected other program */}
                  {(() => {
                    const activeOtherProgId =
                      selectedProgramId ||
                      allPrograms.filter((p) => p.id !== section.program?.id)[0]?.id;
                    const activeProgObj = allPrograms.find((p) => p.id === activeOtherProgId);

                    // Filter allCurriculums that connect with this program
                    const currsForOtherProg = allCurriculums.filter(
                      (c: any) =>
                        c.programs?.some((p: any) => p.id === activeOtherProgId) ||
                        c.programId === activeOtherProgId,
                    );

                    if (isLoadingAllCurriculums) {
                      return (
                        <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-center text-sm">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading curriculum details...
                        </div>
                      );
                    }

                    if (currsForOtherProg.length === 0) {
                      return (
                        <div className="rounded-md border border-dashed p-8 text-center">
                          <p className="text-sm font-medium">No curriculum on record</p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {activeProgObj?.name || 'Selected program'} does not have any published
                            curriculums.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {currsForOtherProg.map((curr: any) => (
                          <div key={curr.id} className="bg-muted/5 space-y-4 rounded-lg border p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-semibold">{curr.name}</h5>
                                  <Badge variant="secondary" className="text-xs">
                                    {curr.versionNumber}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {curr.status}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                  Program: {activeProgObj?.name} ({activeProgObj?.code})
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-background text-xs">
                                Read Only
                              </Badge>
                            </div>

                            {curr.curriculumTerms && curr.curriculumTerms.length > 0 ? (
                              <div className="space-y-3">
                                {curr.curriculumTerms.map((term: any) => {
                                  const cList = term.curriculumCourses || [];
                                  return (
                                    <div
                                      key={term.id}
                                      className="bg-card space-y-2 rounded border p-3"
                                    >
                                      <div className="flex items-center justify-between text-xs font-semibold">
                                        <span>{term.name}</span>
                                        <span className="text-muted-foreground font-normal">
                                          {cList.length} course{cList.length === 1 ? '' : 's'}
                                        </span>
                                      </div>
                                      {cList.length > 0 ? (
                                        <div className="overflow-x-auto">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead className="w-24 text-xs">Code</TableHead>
                                                <TableHead className="text-xs">
                                                  Course Name
                                                </TableHead>
                                                <TableHead className="w-20 text-xs">
                                                  Credits
                                                </TableHead>
                                                <TableHead className="w-24 text-xs">Type</TableHead>
                                                <TableHead className="text-xs">
                                                  Department
                                                </TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {cList.map((cc: any) => {
                                                const cObj = cc.course || cc;
                                                return (
                                                  <TableRow key={cc.id || cObj.id}>
                                                    <TableCell className="font-mono text-xs font-medium">
                                                      {cObj.code}
                                                    </TableCell>
                                                    <TableCell className="text-xs font-medium">
                                                      {cObj.name}
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                      {cc.creditValue ?? cObj.creditValue ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                      <Badge
                                                        variant={
                                                          cc.isMandatory ? 'default' : 'outline'
                                                        }
                                                        className="px-1.5 py-0 text-[10px]"
                                                      >
                                                        {cc.isMandatory ? 'Mandatory' : 'Elective'}
                                                      </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-xs">
                                                      {cObj.department?.name || '-'}
                                                    </TableCell>
                                                  </TableRow>
                                                );
                                              })}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground text-xs italic">
                                          No courses assigned to this term.
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-muted-foreground py-2 text-xs italic">
                                No terms available in this curriculum.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </TabsContent>
          </Tabs>
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

      {/* Assign Faculty to Course / Section Modal */}
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
            academicYear: section.academicYear,
          }}
          course={modalCourse}
          availableTerms={termsData || []}
          currentAssignment={activeCourseAssignment}
        />
      )}
    </div>
  );
}
