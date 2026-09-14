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
  History,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminSection, CourseAssignment } from '@/hooks/api/admin/useSections';
import { useAdminCourses, type Course } from '@/hooks/api/admin/useCourses';
import { useAcademicTerms } from '@/hooks/api/admin/useAcademicTerms';
import { useAdminCurriculumsByProgram } from '@/hooks/api/admin/useCurriculums';
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

// Unified Faculty & Role interface for section-level display
interface UnifiedFacultyRole {
  facultyId: string;
  name: string;
  teacherCode: string;
  email: string;
  departmentName?: string | null;
  roleType: 'SECTION_ROLE' | 'COURSE_FACULTY' | 'BOTH';
  sectionRole?: string;
  isPrimaryClassTeacher?: boolean;
  coursesTeaching: Array<{
    id: string;
    code: string;
    name: string;
    creditValue?: number | null;
  }>;
  facultySectionId?: string;
  courseAssignmentIds: string[];
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

  const { data: programCurriculums = [], isLoading: isLoadingProgramCurriculums } =
    useAdminCurriculumsByProgram(section?.program?.id || '');

  const programId = section?.program?.id || '';
  const { data: programCoursesData, isLoading: isLoadingProgramCourses } = useAdminCourses(
    1,
    200,
    '',
    '',
    '',
    '',
    { enabled: !!programId, programId },
  );
  const programCourses = programCoursesData?.data || [];

  // Separate curriculum terms into previous, current, and upcoming relative to this section's semester
  const sectionSemester = section?.semester ?? null;

  // Flatten all curriculums for the program
  const activeCurriculum =
    programCurriculums.find((c: any) => c.status === 'ACTIVE') || programCurriculums[0];
  const allCurriculumTerms: any[] = activeCurriculum?.curriculumTerms || [];

  // Categorize terms based on sequence vs section semester
  const previousTerms =
    sectionSemester != null
      ? allCurriculumTerms.filter((t: any) => t.sequence < sectionSemester)
      : [];

  const currentTerms =
    sectionSemester != null
      ? allCurriculumTerms.filter((t: any) => t.sequence === sectionSemester)
      : allCurriculumTerms;

  const upcomingTerms =
    sectionSemester != null
      ? allCurriculumTerms.filter((t: any) => t.sequence > sectionSemester)
      : [];

  // Count total courses in each category
  const countTermCourses = (terms: any[]) =>
    terms.reduce((acc, t) => acc + (t.curriculumCourses?.length || 0), 0);

  const previousCoursesCount = countTermCourses(previousTerms);
  const currentCoursesCount = countTermCourses(currentTerms);
  const upcomingCoursesCount = countTermCourses(upcomingTerms);

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

  // Unified faculty map across both section-level roles and course assignments
  const unifiedFacultyMap = new Map<string, UnifiedFacultyRole>();
  const departmentSet = new Set<string>();
  const assignedCoursesSet = new Set<string>();

  // 1. Process course assignments (subject teachers)
  if (section.courseAssignments) {
    for (const ca of section.courseAssignments) {
      if (!ca.faculty) continue;
      const fid = ca.faculty.id;
      const dept = ca.faculty.department?.name;
      if (dept) departmentSet.add(dept);
      if (ca.course) assignedCoursesSet.add(ca.course.id);

      const existing = unifiedFacultyMap.get(fid);
      if (existing) {
        if (ca.course && !existing.coursesTeaching.some((c) => c.id === ca.course.id)) {
          existing.coursesTeaching.push({
            id: ca.course.id,
            code: ca.course.code,
            name: ca.course.name,
            creditValue: ca.course.creditValue,
          });
        }
        if (!existing.courseAssignmentIds.includes(ca.id)) {
          existing.courseAssignmentIds.push(ca.id);
        }
      } else {
        unifiedFacultyMap.set(fid, {
          facultyId: fid,
          name: `${ca.faculty.user?.firstName || ''} ${ca.faculty.user?.lastName || ''}`.trim(),
          teacherCode: ca.faculty.teacherCode,
          email: ca.faculty.user?.email || '',
          departmentName: ca.faculty.department?.name,
          roleType: 'COURSE_FACULTY',
          coursesTeaching: ca.course
            ? [
                {
                  id: ca.course.id,
                  code: ca.course.code,
                  name: ca.course.name,
                  creditValue: ca.course.creditValue,
                },
              ]
            : [],
          courseAssignmentIds: [ca.id],
        });
      }
    }
  }

  // 2. Process section-level roles (class teachers, teachers, mentors)
  if (sectionFacultyList) {
    for (const sf of sectionFacultyList) {
      if (!sf.faculty) continue;
      const fid = sf.faculty.id;
      const dept = sf.faculty.department?.name;
      if (dept) departmentSet.add(dept);

      const existing = unifiedFacultyMap.get(fid);
      if (existing) {
        existing.roleType = 'BOTH';
        existing.sectionRole = sf.role;
        existing.isPrimaryClassTeacher = sf.isPrimary;
        existing.facultySectionId = sf.id;
      } else {
        unifiedFacultyMap.set(fid, {
          facultyId: fid,
          name: `${sf.faculty.user?.firstName || ''} ${sf.faculty.user?.lastName || ''}`.trim(),
          teacherCode: sf.faculty.teacherCode,
          email: sf.faculty.user?.email || '',
          departmentName: sf.faculty.department?.name,
          roleType: 'SECTION_ROLE',
          sectionRole: sf.role,
          isPrimaryClassTeacher: sf.isPrimary,
          coursesTeaching: [],
          facultySectionId: sf.id,
          courseAssignmentIds: [],
        });
      }
    }
  }

  const unifiedFacultyList = Array.from(unifiedFacultyMap.values()).sort((a, b) => {
    // Primary class teachers first, then section roles, then course faculties
    if (a.isPrimaryClassTeacher && !b.isPrimaryClassTeacher) return -1;
    if (!a.isPrimaryClassTeacher && b.isPrimaryClassTeacher) return 1;
    if (a.sectionRole === 'CLASS_TEACHER' && b.sectionRole !== 'CLASS_TEACHER') return -1;
    if (a.sectionRole !== 'CLASS_TEACHER' && b.sectionRole === 'CLASS_TEACHER') return 1;
    return a.name.localeCompare(b.name);
  });

  const studentCount = section._count?.students ?? 0;
  const facultyCount = unifiedFacultyList.length;

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
  // 1. Program courses from the database
  // 2. Program courses returned on section.program
  // 3. Section-specific course offerings
  // 4. Supplemented by existing course assignments
  // 5. Supplemented by current curriculum term courses
  const sectionCourses: Course[] = (() => {
    const courseMap = new Map<string, Course>();

    // 1. Add program courses fetched from database
    if (programCourses) {
      for (const pc of programCourses) {
        courseMap.set(pc.id, {
          id: pc.id,
          code: pc.code,
          name: pc.name,
          creditValue: pc.creditValue ?? pc.credits ?? undefined,
          credits: pc.creditValue ?? pc.credits ?? 0,
          status: pc.status || 'ACTIVE',
          department: pc.department
            ? {
                id: pc.department.id,
                name: pc.department.name,
              }
            : undefined,
          program:
            pc.program ||
            (section.program ? { id: section.program.id, name: section.program.name } : undefined),
        });
      }
    }

    // 2. Add section program courses if present on section.program
    if (section.program?.courses) {
      for (const c of section.program.courses) {
        if (!courseMap.has(c.id)) {
          courseMap.set(c.id, {
            id: c.id,
            code: c.code,
            name: c.name,
            creditValue: c.creditValue ?? undefined,
            credits: c.creditValue ?? 0,
            status: c.status || 'ACTIVE',
            department: c.department
              ? {
                  id: c.department.id,
                  name: c.department.name,
                }
              : undefined,
            program: { id: section.program.id, name: section.program.name },
          });
        }
      }
    }

    // 3. Add section-specific course offerings
    if (section.courseOfferings) {
      for (const offering of section.courseOfferings) {
        if (offering.course) {
          const existing = courseMap.get(offering.course.id);
          if (existing) {
            if (!existing.department && offering.course.department) {
              existing.department = {
                id: offering.course.department.id,
                name: offering.course.department.name,
              };
            }
          } else {
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
              program: section.program
                ? { id: section.program.id, name: section.program.name }
                : undefined,
            });
          }
        }
      }
    }

    // 4. Add courses from existing course assignments if not already present
    if (section.courseAssignments) {
      for (const ca of section.courseAssignments) {
        if (ca.course?.id) {
          const existing = courseMap.get(ca.course.id);
          if (existing) {
            if (!existing.department && ca.faculty?.department) {
              existing.department = {
                id: ca.faculty.department.id,
                name: ca.faculty.department.name,
              };
            }
          } else {
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
              program: section.program
                ? { id: section.program.id, name: section.program.name }
                : undefined,
            });
          }
        }
      }
    }

    // 5. Add courses from current curriculum terms if any
    for (const term of currentTerms) {
      if (term.curriculumCourses) {
        for (const cc of term.curriculumCourses) {
          const cObj = cc.course || cc;
          if (cObj?.id && !courseMap.has(cObj.id)) {
            courseMap.set(cObj.id, {
              id: cObj.id,
              code: cObj.code,
              name: cObj.name,
              creditValue: cc.creditValue ?? cObj.creditValue ?? undefined,
              credits: cc.creditValue ?? cObj.creditValue ?? 0,
              status: cObj.status || 'ACTIVE',
              department: cObj.department
                ? {
                    id: cObj.department.id,
                    name: cObj.department.name,
                  }
                : undefined,
              program: section.program
                ? { id: section.program.id, name: section.program.name }
                : undefined,
            });
          }
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
            <div className="text-2xl font-bold">{sectionCourses.length}</div>
            <p className="text-muted-foreground text-xs">
              {sectionCourses.length === 1 ? 'course' : 'courses'} offered
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

      {/* Course Offerings & Curriculum Progression */}
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
                Courses offered in the current program, past terms, and upcoming curriculum courses.
              </CardDescription>
            </div>
            {section.program?.id && activeCurriculum?.id && (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/admin/academics/programs/${section.program.id}/curriculums/${activeCurriculum.id}`}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" /> Full Curriculum View
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="current-program" className="w-full">
            <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 p-1">
              <TabsTrigger value="current-program" className="text-xs sm:text-sm">
                Current Program Courses (
                {sectionCourses.length > 0 ? sectionCourses.length : currentCoursesCount})
              </TabsTrigger>
              <TabsTrigger value="upcoming-program" className="text-xs sm:text-sm">
                Upcoming Courses ({upcomingCoursesCount})
              </TabsTrigger>
              <TabsTrigger value="previous-program" className="text-xs sm:text-sm">
                Previous Courses ({previousCoursesCount})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Current Program Courses */}
            <TabsContent value="current-program" className="space-y-4">
              <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-sm font-semibold">
                    Current Program Course Offerings{' '}
                    {section.semester != null ? `(Semester ${section.semester})` : ''}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Courses offered for this section and current program semester with faculty
                    assignments.
                  </p>
                </div>
                <div className="text-muted-foreground text-xs">
                  {sectionCourses.length} active offering{sectionCourses.length === 1 ? '' : 's'} •{' '}
                  {sectionCourses.length - unassignedCount} faculty assigned
                </div>
              </div>

              {/* Active Section Course Offerings (with Faculty Assign / Change) */}
              {isLoadingProgramCourses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                </div>
              ) : sectionCourses.length === 0 ? (
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

              {/* Current Curriculum Structure if available */}
              {currentTerms.length > 0 && (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <h5 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Curriculum Course Breakdown for Current Term
                  </h5>
                  {currentTerms.map((term: any) => (
                    <div key={term.id} className="bg-muted/10 space-y-2 rounded-md border p-3">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>
                          {term.name} (Sequence {term.sequence})
                        </span>
                        {term.creditRequirement != null && (
                          <span className="text-muted-foreground">
                            Required: {term.creditRequirement} credits
                          </span>
                        )}
                      </div>
                      {term.curriculumCourses && term.curriculumCourses.length > 0 ? (
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
                              {term.curriculumCourses.map((cc: any) => {
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
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: Upcoming Programs & Courses */}
            <TabsContent value="upcoming-program" className="space-y-4">
              <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="text-primary h-4 w-4" />
                    Upcoming Terms & Courses
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Future curriculum terms and scheduled courses following the program curriculum
                    structure.
                  </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs">
                  {upcomingTerms.length} Upcoming Term{upcomingTerms.length === 1 ? '' : 's'}
                </Badge>
              </div>

              {isLoadingProgramCurriculums ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading upcoming curriculum...
                </div>
              ) : upcomingTerms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <BookOpen className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-lg font-medium">No upcoming courses</p>
                  <p className="text-muted-foreground text-sm">
                    {section.semester != null
                      ? `This section is at Semester ${section.semester}, which is the final term configured in the curriculum.`
                      : 'No future curriculum terms configured for this program.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTerms.map((term: any) => {
                    const coursesList = term.curriculumCourses || [];
                    const termCredits = coursesList.reduce(
                      (sum: number, cc: any) =>
                        sum + (cc.creditValue || cc.course?.creditValue || 0),
                      0,
                    );

                    return (
                      <div key={term.id} className="bg-card space-y-3 rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{term.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              Term Sequence {term.sequence}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Upcoming
                            </Badge>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-3 text-xs">
                            <span>
                              Credits: {termCredits}
                              {term.creditRequirement
                                ? ` / ${term.creditRequirement} required`
                                : ''}
                            </span>
                            <span>•</span>
                            <span>
                              {coursesList.length} course{coursesList.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>

                        {coursesList.length === 0 ? (
                          <p className="text-muted-foreground py-2 text-xs italic">
                            No courses listed under this term yet.
                          </p>
                        ) : (
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: Previous Programs & Courses */}
            <TabsContent value="previous-program" className="space-y-4">
              <div className="flex flex-col gap-1 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                    <History className="text-muted-foreground h-4 w-4" />
                    Previous Terms & Courses
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Courses offered in earlier semesters of this curriculum prior to current
                    semester.
                  </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs">
                  {previousTerms.length} Previous Term{previousTerms.length === 1 ? '' : 's'}
                </Badge>
              </div>

              {isLoadingProgramCurriculums ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading previous curriculum...
                </div>
              ) : previousTerms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Clock className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-lg font-medium">No previous terms</p>
                  <p className="text-muted-foreground text-sm">
                    {section.semester === 1
                      ? 'This section is at Semester 1 (initial entry term). There are no previous curriculum terms.'
                      : 'No earlier terms found for this program.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {previousTerms.map((term: any) => {
                    const coursesList = term.curriculumCourses || [];
                    const termCredits = coursesList.reduce(
                      (sum: number, cc: any) =>
                        sum + (cc.creditValue || cc.course?.creditValue || 0),
                      0,
                    );

                    return (
                      <div key={term.id} className="bg-card space-y-3 rounded-lg border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{term.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              Term Sequence {term.sequence}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Completed / Previous
                            </Badge>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-3 text-xs">
                            <span>Credits: {termCredits}</span>
                            <span>•</span>
                            <span>
                              {coursesList.length} course{coursesList.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>

                        {coursesList.length === 0 ? (
                          <p className="text-muted-foreground py-2 text-xs italic">
                            No courses recorded for this term.
                          </p>
                        ) : (
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
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Faculty & Roles Card */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Faculty & Roles</CardTitle>
              <Badge variant="outline" className="text-xs">
                {unifiedFacultyList.length} Total
              </Badge>
            </div>
            <CardDescription>
              All faculty members and roles responsible for this section — including Class Teachers,
              Section In-charges, and Course/Subject Teachers.
            </CardDescription>
          </div>
          <Button onClick={() => setIsAssigningRole(!isAssigningRole)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Assign Section Role
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAssigningRole && (
            <div className="bg-muted/50 mb-6 rounded-md border p-4">
              <h3 className="mb-3 text-sm font-semibold">Assign Faculty to Section Role</h3>
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
              <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
              Loading faculty roles...
            </div>
          ) : unifiedFacultyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <UserCheck className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-lg font-medium">No faculty roles assigned</p>
              <p className="text-muted-foreground text-sm">
                No class teachers or course faculties are currently assigned to this section.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {unifiedFacultyList.map((fMember) => (
                <div
                  key={fMember.facultyId}
                  className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      <GraduationCap className="text-primary h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground font-semibold">{fMember.name}</span>

                        {/* Section-level role badge */}
                        {fMember.sectionRole && (
                          <Badge
                            variant={
                              fMember.sectionRole === 'CLASS_TEACHER'
                                ? 'default'
                                : fMember.sectionRole === 'TEACHER'
                                  ? 'outline'
                                  : 'secondary'
                            }
                            className="text-xs capitalize"
                          >
                            {fMember.sectionRole.replace('_', ' ').toLowerCase()}
                          </Badge>
                        )}

                        {/* Primary Class Teacher badge */}
                        {fMember.isPrimaryClassTeacher && (
                          <Badge
                            variant="default"
                            className="bg-emerald-600 text-xs hover:bg-emerald-700"
                          >
                            <ShieldCheck className="mr-1 h-3 w-3" /> Primary
                          </Badge>
                        )}

                        {/* Subject / Course Teacher badge */}
                        {fMember.coursesTeaching.length > 0 && (
                          <Badge
                            variant="outline"
                            className="border-blue-500/40 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-400"
                          >
                            Subject Teacher
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span>Code: {fMember.teacherCode}</span>
                        <span>•</span>
                        <span>{fMember.email}</span>
                        {fMember.departmentName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {fMember.departmentName}
                            </span>
                          </>
                        )}
                      </p>

                      {/* Taught courses tags */}
                      {fMember.coursesTeaching.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-muted-foreground text-xs font-medium">
                            Courses:
                          </span>
                          {fMember.coursesTeaching.map((crs) => (
                            <Badge
                              key={crs.id}
                              variant="secondary"
                              className="text-[11px] font-normal"
                            >
                              {crs.code} — {crs.name}
                              {crs.creditValue != null ? ` (${crs.creditValue} cr)` : ''}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    {/* If this faculty has a section role, allow removing the section role */}
                    {fMember.facultySectionId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
                        disabled={deleteSectionFaculty.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              `Remove section role "${fMember.sectionRole}" for ${fMember.name}?`,
                            )
                          ) {
                            deleteSectionFaculty.mutate(fMember.facultySectionId!);
                          }
                        }}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove Role
                      </Button>
                    )}
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
