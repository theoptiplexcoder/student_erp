'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@student-erp/ui';
import { useAdminCourses } from '@/hooks/api/admin/useCourses';
import { useAdminFaculty } from '@/hooks/api/admin/useFaculty';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminRooms } from '@/hooks/api/admin/useRooms';
import { AlertTriangle, AlertCircle, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { checkCandidateEntryConflicts, TimetableConflict } from './timetable-conflict-utils';

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

  const courses = coursesData?.data || [];
  const faculties = facultyData?.data || [];
  const sections = sectionsData?.data || [];
  const rooms = roomsData?.data || [];

  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('MONDAY');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [roomId, setRoomId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      } else {
        setCourseId('');
        setFacultyId('');
        setSectionId('');
        setDayOfWeek('MONDAY');
        setStartTime('09:00');
        setEndTime('10:00');
        setRoomId('');
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

    if (!courseId) {
      setErrorMessage('Please select a course.');
      return;
    }
    if (!facultyId) {
      setErrorMessage('Please select a faculty member.');
      return;
    }
    if (!sectionId) {
      setErrorMessage('Please select a section.');
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

    if (onSave) {
      try {
        await onSave({
          id: entry?.id,
          courseId,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {entry?.id ? 'Edit Timetable Entry' : 'Schedule Timetable Entry'}
          </DialogTitle>
        </DialogHeader>

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

          {/* Course */}
          <div className="space-y-1.5">
            <Label htmlFor="course-select" className="text-xs font-medium">
              Course *
            </Label>
            <select
              id="course-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="border-input bg-background focus:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              required
            >
              <option value="">Select Course...</option>
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Faculty */}
          <div className="space-y-1.5">
            <Label htmlFor="faculty-select" className="text-xs font-medium">
              Faculty / Teacher *
            </Label>
            <select
              id="faculty-select"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="border-input bg-background focus:ring-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              required
            >
              <option value="">Select Faculty...</option>
              {faculties.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.user?.firstName} {f.user?.lastName} ({f.teacherCode})
                </option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <Label htmlFor="section-select" className="text-xs font-medium">
              Section *
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

          {/* Day */}
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
              Classroom / Room (Optional)
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
                disabled={isSaving}
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
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Slot'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
