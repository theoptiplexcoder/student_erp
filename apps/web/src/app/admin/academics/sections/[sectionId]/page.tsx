'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
} from '@student-erp/ui';
import { ArrowLeft, MapPin, Users, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAdminSection, CourseAssignment } from '@/hooks/api/admin/useSections';

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

export default function SectionDetailPage({ params }: { params: { sectionId: string } }) {
  const { sectionId } = params;
  const { data: section, isLoading, isError, error } = useAdminSection(sectionId);

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

      {/* Faculty assignments card */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Assignments</CardTitle>
          <CardDescription>
            {facultyCount} faculty member{facultyCount === 1 ? '' : 's'} teaching in this section
            {departmentSet.size > 0 && (
              <span className="ml-2 text-xs">
                Across {departmentSet.size} department{departmentSet.size === 1 ? '' : 's'}:{' '}
                {Array.from(departmentSet).join(', ')}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {facultyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Users className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-lg font-medium">No faculty assigned</p>
              <p className="text-muted-foreground text-sm">
                No course assignments have been made for this section yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {facultyList.map(({ faculty, courses }) => (
                <div key={faculty.id} className="border-primary border-l-2 py-1 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">
                        {faculty.user.firstName} {faculty.user.lastName}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-2 text-sm">
                        {faculty.teacherCode && (
                          <>
                            <span>Code: {faculty.teacherCode}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{faculty.department?.name || 'Department not assigned'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {courses.map((course) => (
                      <Badge key={course.id} variant="outline" className="text-xs">
                        {course.code}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-1">
                    <p className="text-muted-foreground text-xs">Teaching:</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {courses.map((course) => (
                        <span key={course.id} className="text-muted-foreground text-xs">
                          {course.code} — {course.name}
                          {course.creditValue != null && ` (${course.creditValue}cr)`}
                        </span>
                      ))}
                    </div>
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
