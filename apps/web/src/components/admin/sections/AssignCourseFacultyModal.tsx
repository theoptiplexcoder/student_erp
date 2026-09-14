'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Badge,
  Checkbox,
} from '@student-erp/ui';
import { useAdminFaculty, useAssignFacultyClass } from '@/hooks/api/admin/useFaculty';
import {
  useAdminCreateCourseAssignment,
  useAdminCourseAssignments,
} from '@/hooks/api/admin/useCourseAssignments';
import { useAdminRoles } from '@/hooks/api/admin/useRoles';
import { useAdminCreateFacultySection } from '@/hooks/api/admin/useFacultySections';
import { BookOpen, User, Building, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AssignCourseFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: {
    id: string;
    name: string;
    code: string;
    academicYear?: {
      id: string;
      name?: string;
    } | null;
  };
  course?: {
    id: string;
    name: string;
    code: string;
    department?: {
      id: string;
      name: string;
    } | null;
  } | null;
  availableTerms?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  currentAssignment?: {
    id: string;
    faculty: {
      id: string;
      teacherCode: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
  } | null;
}

export function AssignCourseFacultyModal({
  isOpen,
  onClose,
  section,
  course,
  availableTerms,
  currentAssignment,
}: AssignCourseFacultyModalProps) {
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedRole, setSelectedRole] = useState('TEACHER');
  const [isPrimaryRole, setIsPrimaryRole] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch all faculty members (page 1, up to 100) - only when modal is open
  const { data: facultyResponse, isLoading: isLoadingFaculty } = useAdminFaculty(1, 100, '', {
    enabled: isOpen,
  });
  const allFaculty = facultyResponse?.data || [];

  // Fetch roles for selection
  const { data: customRoles = [] } = useAdminRoles({ enabled: isOpen });

  // Fetch institution-wide course assignments to determine current workloads - only when modal is open
  const { data: allAssignments = [], isLoading: isLoadingAssignments } = useAdminCourseAssignments(
    undefined,
    { enabled: isOpen },
  );

  const createAssignment = useAdminCreateCourseAssignment();
  const assignFacultyClass = useAssignFacultyClass();
  const createSectionFaculty = useAdminCreateFacultySection();

  // Reset/Pre-fill term on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSelectedFacultyId(currentAssignment?.faculty?.id || '');
      setSelectedRole('TEACHER');
      setIsPrimaryRole(false);
      if (availableTerms && availableTerms.length > 0) {
        setSelectedTermId(availableTerms[0]?.id || '');
      } else {
        setSelectedTermId('');
      }
    }
  }, [isOpen, availableTerms, currentAssignment]);

  // Filter faculties by the course department
  const courseDepartmentId = course?.department?.id;
  const filteredFaculty = useMemo(() => {
    if (!courseDepartmentId) {
      return allFaculty;
    }
    const matching = allFaculty.filter(
      (f) => f.departmentId === courseDepartmentId || f.department?.id === courseDepartmentId,
    );
    // If no faculty in that specific department, fallback to all faculty with a notice
    return matching.length > 0 ? matching : allFaculty;
  }, [allFaculty, courseDepartmentId]);

  const hasDepartmentMismatchFallback =
    Boolean(courseDepartmentId) &&
    allFaculty.length > 0 &&
    !allFaculty.some(
      (f) => f.departmentId === courseDepartmentId || f.department?.id === courseDepartmentId,
    );

  // Map each faculty ID to their currently taught classes
  const facultyWorkloadMap = useMemo(() => {
    const map = new Map<
      string,
      Array<{
        id: string;
        courseName: string;
        courseCode: string;
        sectionName: string;
      }>
    >();

    for (const assignment of allAssignments) {
      if (!assignment.facultyId) continue;
      const list = map.get(assignment.facultyId) || [];
      list.push({
        id: assignment.id,
        courseName: assignment.course?.name || 'Course',
        courseCode: assignment.course?.code || '',
        sectionName: assignment.section?.name || 'Section',
      });
      map.set(assignment.facultyId, list);
    }

    return map;
  }, [allAssignments]);

  const selectedFaculty = allFaculty.find((f) => f.id === selectedFacultyId);
  const selectedFacultyWorkload = selectedFacultyId
    ? facultyWorkloadMap.get(selectedFacultyId) || []
    : [];

  const handleClose = () => {
    setSelectedFacultyId('');
    setErrorMessage(null);
    onClose();
  };

  const isSubmitting =
    createAssignment.isPending || assignFacultyClass.isPending || createSectionFaculty.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFacultyId) {
      setErrorMessage('Please select a faculty member.');
      return;
    }

    const academicYearId = section.academicYear?.id;

    try {
      // 1. Assign Section Role if section has an academic year
      if (academicYearId && selectedRole) {
        await createSectionFaculty.mutateAsync({
          facultyId: selectedFacultyId,
          sectionId: section.id,
          role: selectedRole,
          academicYearId,
          isPrimary: isPrimaryRole,
        });
      }

      // 2. Assign Course (termId is optional; backend auto-provisions if not provided)
      if (course) {
        await assignFacultyClass.mutateAsync({
          id: selectedFacultyId,
          data: {
            courseId: course.id,
            sectionId: section.id,
            ...(selectedTermId ? { termId: selectedTermId } : {}),
            isPrimary: true,
          },
        });
      }

      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to assign faculty to section/course.',
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="text-primary h-5 w-5" />
            Assign Faculty to Section & Course
          </DialogTitle>
          <DialogDescription>
            Assign a faculty member to section{' '}
            <strong className="text-foreground">{section.name}</strong>
            {course ? (
              <>
                {' '}
                to teach <strong className="text-foreground">{course.name}</strong> ({course.code})
              </>
            ) : null}
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Course & Department Info Badge (if course is provided) */}
          {course && (
            <div className="bg-muted/40 rounded-lg border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs font-semibold uppercase">
                  Course Department
                </span>
                <Badge variant="outline" className="text-xs">
                  {course?.department?.name ? (
                    <>
                      <Building className="mr-1 h-3 w-3" />
                      {course.department.name}
                    </>
                  ) : (
                    'No Department Set'
                  )}
                </Badge>
              </div>
              {hasDepartmentMismatchFallback && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Note: No faculty found specifically in this department. Showing all available
                  faculty.
                </p>
              )}
            </div>
          )}

          {/* Faculty Dropdown with Department Filtering and Teaching Classes Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="assign-faculty-select">Faculty Member</Label>
              {course?.department?.name && !hasDepartmentMismatchFallback && (
                <span className="text-muted-foreground text-xs">
                  Showing {course.department.name} department
                </span>
              )}
            </div>

            <select
              id="assign-faculty-select"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              disabled={isLoadingFaculty || isSubmitting}
              required
            >
              <option value="">Select Faculty...</option>
              {filteredFaculty.map((f) => {
                const classes = facultyWorkloadMap.get(f.id) || [];
                const classSummary =
                  classes.length === 0
                    ? 'No current classes'
                    : `${classes.length} class${classes.length === 1 ? '' : 'es'} teaching: ${classes
                        .map((c) => `${c.sectionName} (${c.courseCode})`)
                        .join(', ')}`;

                return (
                  <option key={f.id} value={f.id}>
                    {f.user?.firstName} {f.user?.lastName} ({f.teacherCode}) — [{classSummary}]
                  </option>
                );
              })}
            </select>
          </div>

          {/* Section Role Select */}
          <div className="space-y-2">
            <Label htmlFor="assign-role-select">Section Role</Label>
            <select
              id="assign-role-select"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={isSubmitting}
              required
            >
              <optgroup label="Standard Roles">
                <option value="TEACHER">Teacher</option>
                <option value="CLASS_TEACHER">Class Teacher</option>
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

          {/* Academic Term Select (Optional) */}
          {availableTerms && availableTerms.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assign-term-select">
                Academic Term{' '}
                <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </Label>
              <select
                id="assign-term-select"
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Default Term (Auto-assigned)</option>
                {availableTerms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name} ({term.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Primary Class Teacher Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="is-primary-role"
              checked={isPrimaryRole}
              onCheckedChange={(checked) => setIsPrimaryRole(Boolean(checked))}
              disabled={isSubmitting}
            />
            <Label htmlFor="is-primary-role" className="cursor-pointer text-sm font-normal">
              Primary Section In-Charge / Class Teacher
            </Label>
          </div>

          {/* Selected Faculty Teaching Workload Preview Card */}
          {selectedFaculty && (
            <div className="bg-card border-border rounded-md border p-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <User className="text-primary h-4 w-4" />
                <span>
                  {selectedFaculty.user?.firstName} {selectedFaculty.user?.lastName} (
                  {selectedFaculty.teacherCode})
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {selectedFaculty.department?.name || 'Department Unassigned'} •{' '}
                <span className="capitalize">{selectedFaculty.employmentType?.toLowerCase()}</span>
              </p>

              <div className="mt-3 border-t pt-2">
                <span className="text-muted-foreground text-xs font-semibold uppercase">
                  Currently Teaching ({selectedFacultyWorkload.length}):
                </span>
                {isLoadingAssignments ? (
                  <p className="text-muted-foreground mt-1 text-xs">Loading classes...</p>
                ) : selectedFacultyWorkload.length === 0 ? (
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    No classes currently assigned. Free to take this course.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedFacultyWorkload.map((item, idx) => (
                      <Badge
                        key={`${item.id}-${idx}`}
                        variant="secondary"
                        className="max-w-[280px] truncate text-xs font-normal"
                        title={`${item.sectionName} - ${item.courseName} (${item.courseCode})`}
                      >
                        {item.sectionName}: {item.courseCode}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedFacultyId || isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Faculty'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
