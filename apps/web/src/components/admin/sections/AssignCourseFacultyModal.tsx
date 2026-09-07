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
} from '@student-erp/ui';
import { useAdminFaculty } from '@/hooks/api/admin/useFaculty';
import {
  useAdminCreateCourseAssignment,
  useAdminCourseAssignments,
} from '@/hooks/api/admin/useCourseAssignments';
import { BookOpen, User, Building, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AssignCourseFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: {
    id: string;
    name: string;
    code: string;
  };
  course: {
    id: string;
    name: string;
    code: string;
    department?: {
      id: string;
      name: string;
    } | null;
  } | null;
  availableTerms: Array<{
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch all faculty members (page 1, up to 100)
  const { data: facultyResponse, isLoading: isLoadingFaculty } = useAdminFaculty(1, 100);
  const allFaculty = facultyResponse?.data || [];

  // Fetch institution-wide course assignments to determine current workloads
  const { data: allAssignments = [], isLoading: isLoadingAssignments } =
    useAdminCourseAssignments();

  const createAssignment = useAdminCreateCourseAssignment();

  // Reset/Pre-fill term on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSelectedFacultyId(currentAssignment?.faculty?.id || '');
      if (availableTerms.length > 0 && !selectedTermId) {
        setSelectedTermId(availableTerms[0]?.id || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!course) {
      setErrorMessage('No course selected.');
      return;
    }

    if (!selectedFacultyId) {
      setErrorMessage('Please select a faculty member.');
      return;
    }

    if (!selectedTermId) {
      setErrorMessage('Please select an academic term.');
      return;
    }

    try {
      await createAssignment.mutateAsync({
        facultyId: selectedFacultyId,
        courseId: course.id,
        sectionId: section.id,
        termId: selectedTermId,
        isPrimary: true,
      });
      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to assign faculty to course.',
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="text-primary h-5 w-5" />
            Assign Faculty to Course
          </DialogTitle>
          <DialogDescription>
            Assign a faculty member to teach{' '}
            <strong className="text-foreground">{course?.name}</strong> ({course?.code}) for section{' '}
            <strong className="text-foreground">{section.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Course & Department Info Badge */}
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

          {/* Academic Term Select */}
          <div className="space-y-2">
            <Label htmlFor="assign-term-select">Academic Term</Label>
            <select
              id="assign-term-select"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              disabled={createAssignment.isPending || availableTerms.length === 0}
              required
            >
              <option value="">Select Academic Term...</option>
              {availableTerms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} ({term.code})
                </option>
              ))}
            </select>
          </div>

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
              disabled={isLoadingFaculty || createAssignment.isPending}
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
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createAssignment.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFacultyId || !selectedTermId || createAssignment.isPending}
            >
              {createAssignment.isPending ? 'Assigning...' : 'Assign Faculty'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
