'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@student-erp/ui';
import { useAdminCourses, useCreateCourse } from '@/hooks/api/admin/useCourses';
import { useAdminFaculty } from '@/hooks/api/admin/useFaculty';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminRooms } from '@/hooks/api/admin/useRooms';
import { useAdminDepartments } from '@/hooks/api/admin/useDepartments';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  Presentation,
  CheckCircle2,
} from 'lucide-react';
import { checkCandidateEntryConflicts, TimetableConflict } from './timetable-conflict-utils';

export type SessionCategory = 'COURSE' | 'EVENT' | 'WORKSHOP' | 'CUSTOM';

interface TimetableEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: any;
  allEntries?: any[];
  onSave?: (entryData: any) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  isSaving?: boolean;
}

function extractTime(val: any): string {
  if (!val) return '';
  if (typeof val === 'string' && val.includes('T')) {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const h = d.getUTCHours().toString().padStart(2, '0');
      const m = d.getUTCMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    }
  }
  if (typeof val === 'string' && val.length >= 5) {
    return val.substring(0, 5);
  }
  return '';
}

export function TimetableEntryForm({
  open,
  onOpenChange,
  entry,
  allEntries = [],
  onSave,
  onDelete,
  isSaving = false,
}: TimetableEntryFormProps) {
  const { data: coursesData } = useAdminCourses(1, 100, '', '', '', '', { enabled: open });
  const { data: facultyData } = useAdminFaculty(1, 100, '', { enabled: open });
  const { data: sectionsData } = useAdminSections(1, 100, '', { enabled: open });
  const { data: roomsData } = useAdminRooms(1, 100, '', '');
  const { data: departmentsData } = useAdminDepartments(1, 100, '');

  const createCourseMutation = useCreateCourse();

  const courses = coursesData?.data || [];
  const faculties = facultyData?.data || [];
  const sections = sectionsData?.data || [];
  const rooms = roomsData?.data || [];
  const departments = departmentsData?.data || [];

  // Active mode tab: COURSE, EVENT, WORKSHOP, CUSTOM
  const [activeTab, setActiveTab] = useState<SessionCategory>('COURSE');

  // Standard Course Session State
  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [roomId, setRoomId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Custom / Event / Workshop Template State
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customOrganizer, setCustomOrganizer] = useState('');
  const [customDepartmentId, setCustomDepartmentId] = useState('');

  // Sync state when entry changes or modal opens
  useEffect(() => {
    if (open) {
      setErrorMessage('');
      if (entry) {
        setCourseId(entry.courseId || entry.course?.id || '');
        setFacultyId(entry.facultyId || entry.faculty?.id || '');
        setSectionId(entry.sectionId || entry.section?.id || '');
        setDayOfWeek(entry.dayOfWeek || 'MONDAY');
        setStartTime(extractTime(entry.startTime) || '09:00');
        setEndTime(extractTime(entry.endTime) || '10:00');
        setRoomId(entry.roomId || entry.room?.id || '');

        // Check if existing course is an event / workshop / custom
        const existingType = entry.course?.courseType;
        if (existingType === 'EVENT') {
          setActiveTab('EVENT');
        } else if (existingType === 'WORKSHOP') {
          setActiveTab('WORKSHOP');
        } else if (existingType === 'CUSTOM') {
          setActiveTab('CUSTOM');
        } else {
          setActiveTab('COURSE');
        }

        setCustomTitle(entry.course?.name || '');
        setCustomDescription(entry.course?.description || '');
      } else {
        setCourseId('');
        setFacultyId('');
        setSectionId('');
        setDayOfWeek('MONDAY');
        setStartTime('09:00');
        setEndTime('10:00');
        setRoomId('');
        setActiveTab('COURSE');
        setCustomTitle('');
        setCustomDescription('');
        setCustomOrganizer('');
        setCustomDepartmentId('');
      }
    }
  }, [open, entry]);

  // Real-time conflict detection against all entries
  const activeConflicts = useMemo<TimetableConflict[]>(() => {
    if (!open) return [];
    return checkCandidateEntryConflicts(
      {
        id: entry?.id,
        dayOfWeek,
        startTime,
        endTime,
        facultyId: facultyId || undefined,
        roomId: roomId || undefined,
        sectionId: sectionId || undefined,
      },
      allEntries,
    );
  }, [open, entry?.id, dayOfWeek, startTime, endTime, facultyId, roomId, sectionId, allEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!sectionId) {
      setErrorMessage('Please select a section.');
      return;
    }
    if (!facultyId) {
      setErrorMessage('Please select an instructor or coordinator.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('Please specify both start and end times.');
      return;
    }
    if (startTime >= endTime) {
      setErrorMessage('Start time must be before end time.');
      return;
    }

    let finalCourseId = courseId;

    // Handle Custom / Event / Workshop on-the-spot creation
    if (activeTab !== 'COURSE') {
      if (!customTitle.trim()) {
        const typeLabel =
          activeTab === 'EVENT' ? 'Event' : activeTab === 'WORKSHOP' ? 'Workshop' : 'Session';
        setErrorMessage(`Please enter a title for this ${typeLabel}.`);
        return;
      }

      // If we are scheduling a new slot or replacing the course
      if (!entry?.id || !courseId) {
        try {
          const prefix = activeTab === 'EVENT' ? 'EVT' : activeTab === 'WORKSHOP' ? 'WKS' : 'CUS';
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const autoCode = `${prefix}-${randomSuffix}`;

          const createdCourse = await createCourseMutation.mutateAsync({
            name: customTitle.trim(),
            code: autoCode,
            description: customDescription.trim() || undefined,
            courseType: activeTab,
            creditValue: 0,
            departmentId: customDepartmentId || undefined,
          });

          finalCourseId = createdCourse.id;
        } catch (err: any) {
          setErrorMessage(
            err?.response?.data?.message ||
              err?.message ||
              `Failed to create custom ${activeTab.toLowerCase()} template.`,
          );
          return;
        }
      }
    } else {
      if (!courseId) {
        setErrorMessage('Please select a course.');
        return;
      }
    }

    if (onSave) {
      try {
        await onSave({
          id: entry?.id,
          courseId: finalCourseId,
          facultyId,
          sectionId,
          dayOfWeek,
          startTime,
          endTime,
          roomId: roomId || undefined,
        });
        onOpenChange(false);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to save timetable slot.');
      }
    } else {
      onOpenChange(false);
    }
  };

  const isEditing = !!entry?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold sm:text-lg">
            {isEditing ? 'Edit Scheduled Session' : 'Schedule Timetable Slot'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? 'Update scheduling details or modify existing session parameters.'
              : 'Assign a standard course session, or create an event, workshop, or custom session on the spot.'}
          </DialogDescription>
        </DialogHeader>

        {/* Session Type Switcher Tabs (when creating or editing) */}
        <div className="pt-1">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as SessionCategory)}
            className="w-full"
          >
            <TabsList className="grid h-9 w-full grid-cols-4">
              <TabsTrigger value="COURSE" className="gap-1 text-xs">
                <BookOpen className="hidden h-3.5 w-3.5 shrink-0 sm:inline" />
                <span>Course</span>
              </TabsTrigger>
              <TabsTrigger value="EVENT" className="gap-1 text-xs">
                <Calendar className="hidden h-3.5 w-3.5 shrink-0 sm:inline" />
                <span>Event</span>
              </TabsTrigger>
              <TabsTrigger value="WORKSHOP" className="gap-1 text-xs">
                <Presentation className="hidden h-3.5 w-3.5 shrink-0 sm:inline" />
                <span>Workshop</span>
              </TabsTrigger>
              <TabsTrigger value="CUSTOM" className="gap-1 text-xs">
                <Sparkles className="hidden h-3.5 w-3.5 shrink-0 sm:inline" />
                <span>Custom</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Conflict Warning Banner */}
          {activeConflicts.length > 0 && (
            <div className="space-y-2 rounded-lg border border-red-300 bg-red-50 p-3.5 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-red-700 uppercase dark:text-red-400">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span>
                  {activeConflicts.length} Scheduling Conflict
                  {activeConflicts.length !== 1 ? 's' : ''} Detected
                </span>
              </div>
              <ul className="list-disc space-y-1.5 pl-5 text-xs">
                {activeConflicts.map((c, i) => (
                  <li key={i} className="leading-snug">
                    <span className="font-semibold">{c.type}: </span>
                    {c.message}
                  </li>
                ))}
              </ul>
              <p className="pt-1 text-[11px] text-red-700/80 dark:text-red-400/80">
                Saving with overlapping schedules may cause classroom or faculty double-booking.
              </p>
            </div>
          )}

          {/* Tab 1: Standard Course Session */}
          {activeTab === 'COURSE' && (
            <div className="space-y-1.5">
              <Label htmlFor="course-select" className="text-xs font-medium">
                Course *
              </Label>
              <select
                id="course-select"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="border-input bg-background focus:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                required={activeTab === 'COURSE'}
              >
                <option value="">Select Course...</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}){c.courseType ? ` [${c.courseType}]` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab 2, 3, 4: Custom / Event / Workshop Template */}
          {activeTab !== 'COURSE' && (
            <div className="border-border/80 bg-muted/20 space-y-3 rounded-lg border p-3.5">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-semibold tracking-wide uppercase">
                  {activeTab === 'EVENT'
                    ? 'New Event Template'
                    : activeTab === 'WORKSHOP'
                      ? 'New Workshop Template'
                      : 'Custom Session Template'}
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="custom-title-input" className="text-xs font-medium">
                  {activeTab === 'EVENT'
                    ? 'Event Title *'
                    : activeTab === 'WORKSHOP'
                      ? 'Workshop Title *'
                      : 'Session Title *'}
                </Label>
                <Input
                  id="custom-title-input"
                  placeholder={
                    activeTab === 'EVENT'
                      ? 'e.g., Annual Science Fair, Guest Seminar, Sports Day Briefing'
                      : activeTab === 'WORKSHOP'
                        ? 'e.g., Cloud DevOps Hands-on, AI & ML Bootcamp, Resume Writing'
                        : 'e.g., Remedial Class, Placement Mock Interview, Project Review'
                  }
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description / Agenda */}
              <div className="space-y-1.5">
                <Label htmlFor="custom-desc-input" className="text-xs font-medium">
                  Description / Agenda (Optional)
                </Label>
                <Textarea
                  id="custom-desc-input"
                  rows={2}
                  placeholder="Outline key topics, prerequisites, or session notes..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                />
              </div>

              {/* Department */}
              {departments.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="custom-dep-select" className="text-xs font-medium">
                    Host Department (Optional)
                  </Label>
                  <select
                    id="custom-dep-select"
                    value={customDepartmentId}
                    onChange={(e) => setCustomDepartmentId(e.target.value)}
                    className="border-input bg-background focus:ring-primary flex h-9 w-full rounded-md border px-3 py-1.5 text-xs focus:ring-1 focus:outline-none"
                  >
                    <option value="">General / All Departments</option>
                    {departments.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Section Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="section-select" className="text-xs font-medium">
              Target Section *
            </Label>
            <select
              id="section-select"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="border-input bg-background focus:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              required
            >
              <option value="">Select Section...</option>
              {sections.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty / Instructor */}
          <div className="space-y-1.5">
            <Label htmlFor="faculty-select" className="text-xs font-medium">
              {activeTab === 'COURSE' ? 'Faculty / Teacher *' : 'Instructor / Host / Coordinator *'}
            </Label>
            <select
              id="faculty-select"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="border-input bg-background focus:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              required
            >
              <option value="">Select Instructor / Coordinator...</option>
              {faculties.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.user?.firstName} {f.user?.lastName} ({f.teacherCode})
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div className="space-y-1.5">
            <Label htmlFor="day-select" className="text-xs font-medium">
              Day of Week *
            </Label>
            <select
              id="day-select"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="border-input bg-background focus:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-time-input" className="text-xs font-medium">
                Start Time *
              </Label>
              <Input
                id="start-time-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-time-input" className="text-xs font-medium">
                End Time *
              </Label>
              <Input
                id="end-time-input"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Classroom / Room */}
          <div className="space-y-1.5">
            <Label htmlFor="room-select" className="text-xs font-medium">
              Classroom / Room / Venue (Optional)
            </Label>
            <select
              id="room-select"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="border-input bg-background focus:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="">No Room Assigned</option>
              {rooms.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name} (Room {r.number}){r.capacity ? ` - Cap: ${r.capacity}` : ''}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {entry?.id && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this scheduled slot?')) {
                    await onDelete();
                    onOpenChange(false);
                  }
                }}
                disabled={isSaving || createCourseMutation.isPending}
                className="w-full sm:w-auto"
              >
                Delete Slot
              </Button>
            ) : (
              <div />
            )}
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSaving || createCourseMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving || createCourseMutation.isPending}>
                {isSaving || createCourseMutation.isPending ? 'Saving...' : 'Save Slot'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
