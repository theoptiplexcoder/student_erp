'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@student-erp/ui';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  ShieldAlert,
  SunMedium,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import {
  useAdminTimetable,
  useCreateTimetableEntry,
  useUpdateTimetableEntry,
  useDeleteTimetableEntry,
} from '@student-erp/hooks';
import { useAdminFaculty } from '@/hooks/api/admin/useFaculty';
import { useAdminRooms } from '@/hooks/api/admin/useRooms';
import { formatTimeSlot } from '../timetable/timetable-conflict-utils';

interface SectionTimetableScheduleProps {
  sectionId: string;
  sectionName: string;
  sectionCode?: string;
  termId?: string;
  terms: any[];
  onTermChange?: (termId: string) => void;
  courses: Array<{
    id: string;
    name: string;
    code: string;
    creditValue?: number | null;
  }>;
}

const TIMETABLE_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

type TimetableDayName = (typeof TIMETABLE_DAYS)[number];

const DAY_MAP_JS: Record<number, TimetableDayName> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

function formatDisplayTime(time: string | Date | undefined): string {
  return formatTimeSlot(time);
}

function timeStringToMinutes(str: string): number {
  const parts = str.split(':');
  if (parts.length >= 2) {
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }
  return 0;
}

function minutesToTimeString(minutes: number): string {
  const norm = Math.max(0, Math.min(23 * 60 + 59, minutes));
  const h = Math.floor(norm / 60)
    .toString()
    .padStart(2, '0');
  const m = (norm % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function SectionTimetableSchedule({
  sectionId,
  sectionName,
  sectionCode,
  termId,
  terms,
  onTermChange,
  courses,
}: SectionTimetableScheduleProps) {
  const activeTermId = termId || (terms && terms.length > 0 ? terms[0].id : '');

  // Timetable query for this section and term
  const {
    data: rawData,
    isLoading,
    refetch,
  } = useAdminTimetable({
    termId: activeTermId,
    sectionId,
  });

  const entries = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : (rawData as any).data || [];
  }, [rawData]);

  const { data: facultyResponse } = useAdminFaculty(1, 100, '');
  const facultyList = facultyResponse?.data || [];
  const { data: roomsResponse } = useAdminRooms(1, 100, '', '');
  const roomsList = roomsResponse?.data || [];

  const createEntry = useCreateTimetableEntry();
  const updateEntry = useUpdateTimetableEntry();
  const deleteEntry = useDeleteTimetableEntry();

  // Active view: 'TODAY' | 'SATURDAY' | 'ALL_WEEK'
  const [activeView, setActiveView] = useState<'TODAY' | 'SATURDAY' | 'ALL_WEEK'>('TODAY');

  // Emergency / Bulk Shift modal
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [shiftTargetDay, setShiftTargetDay] = useState<TimetableDayName>('MONDAY');
  const [shiftMinutes, setShiftMinutes] = useState<number>(30);
  const [emergencyReason, setEmergencyReason] = useState<string>('Inclement Weather / Emergency');
  const [isShiftPending, setIsShiftPending] = useState(false);
  const [modalMessage, setModalMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Saturday Preset modal
  const [isSaturdayPresetOpen, setIsSaturdayPresetOpen] = useState(false);
  const [saturdayMode, setSaturdayMode] = useState<'HALF_DAY' | 'CUSTOM'>('HALF_DAY');
  const [satStartTime, setSatStartTime] = useState('09:00');
  const [satDuration, setSatDuration] = useState(40);

  // Single Slot Edit / Create Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any | null>(null);
  const [slotForm, setSlotForm] = useState({
    courseId: '',
    facultyId: '',
    roomId: '',
    dayOfWeek: 'MONDAY' as TimetableDayName,
    startTime: '09:00',
    endTime: '10:00',
  });
  const [slotFormError, setSlotFormError] = useState<string | null>(null);

  // Determine current day of week
  const currentDayOfWeek: TimetableDayName = useMemo(() => {
    const dayNum = new Date().getDay();
    return DAY_MAP_JS[dayNum] || 'MONDAY';
  }, []);

  // Filter entries for Today
  const todayEntries = useMemo(() => {
    return entries
      .filter((e: any) => e.dayOfWeek === currentDayOfWeek)
      .sort((a: any, b: any) =>
        formatDisplayTime(a.startTime).localeCompare(formatDisplayTime(b.startTime)),
      );
  }, [entries, currentDayOfWeek]);

  // Filter entries for Saturday
  const saturdayEntries = useMemo(() => {
    return entries
      .filter((e: any) => e.dayOfWeek === 'SATURDAY')
      .sort((a: any, b: any) =>
        formatDisplayTime(a.startTime).localeCompare(formatDisplayTime(b.startTime)),
      );
  }, [entries]);

  // Emergency / Fast Shift handler for all classes of a selected day
  const handleApplyDayShift = async () => {
    const targetEntries = entries.filter((e: any) => e.dayOfWeek === shiftTargetDay);
    if (targetEntries.length === 0) {
      setModalMessage({
        type: 'error',
        text: `No scheduled classes found for ${shiftTargetDay} to adjust.`,
      });
      return;
    }

    setIsShiftPending(true);
    setModalMessage(null);

    try {
      for (const ent of targetEntries) {
        const origStart = formatDisplayTime(ent.startTime);
        const origEnd = formatDisplayTime(ent.endTime);
        const startMins = timeStringToMinutes(origStart) + shiftMinutes;
        const endMins = timeStringToMinutes(origEnd) + shiftMinutes;

        await updateEntry.mutateAsync({
          id: ent.id,
          data: {
            dayOfWeek: ent.dayOfWeek,
            startTime: minutesToTimeString(startMins),
            endTime: minutesToTimeString(endMins),
          },
        });
      }

      setModalMessage({
        type: 'success',
        text: `Successfully adjusted ${targetEntries.length} class(es) for ${shiftTargetDay} by ${shiftMinutes} minutes.`,
      });
      refetch();
      setTimeout(() => {
        setIsEmergencyModalOpen(false);
        setModalMessage(null);
      }, 1500);
    } catch (err: any) {
      setModalMessage({
        type: 'error',
        text: err?.response?.data?.message || err.message || 'Failed to shift schedule.',
      });
    } finally {
      setIsShiftPending(false);
    }
  };

  // Saturday Preset apply
  const handleApplySaturdayPreset = async () => {
    if (saturdayEntries.length === 0) {
      alert('There are no scheduled Saturday entries yet. Use "Add Slot" to add Saturday classes.');
      setIsSaturdayPresetOpen(false);
      return;
    }

    setIsShiftPending(true);
    try {
      let currentMinutes = timeStringToMinutes(satStartTime);
      const slotDuration = saturdayMode === 'HALF_DAY' ? 40 : satDuration;

      for (const ent of saturdayEntries) {
        const nextStart = minutesToTimeString(currentMinutes);
        const nextEnd = minutesToTimeString(currentMinutes + slotDuration);
        currentMinutes += slotDuration + 10; // 10 min break

        await updateEntry.mutateAsync({
          id: ent.id,
          data: {
            dayOfWeek: 'SATURDAY',
            startTime: nextStart,
            endTime: nextEnd,
          },
        });
      }

      refetch();
      setIsSaturdayPresetOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to apply Saturday timings.');
    } finally {
      setIsShiftPending(false);
    }
  };

  // Open slot editor
  const handleOpenSlotModal = (slot?: any, defaultDay?: TimetableDayName) => {
    setSlotFormError(null);
    if (slot) {
      setEditingSlot(slot);
      setSlotForm({
        courseId: slot.courseId || slot.course?.id || '',
        facultyId: slot.facultyId || slot.faculty?.id || '',
        roomId: slot.roomId || '',
        dayOfWeek: slot.dayOfWeek || 'MONDAY',
        startTime: formatDisplayTime(slot.startTime) || '09:00',
        endTime: formatDisplayTime(slot.endTime) || '10:00',
      });
    } else {
      setEditingSlot(null);
      setSlotForm({
        courseId: courses[0]?.id || '',
        facultyId: facultyList[0]?.id || '',
        roomId: roomsList[0]?.id || '',
        dayOfWeek: defaultDay || (activeView === 'SATURDAY' ? 'SATURDAY' : currentDayOfWeek),
        startTime: '09:00',
        endTime: '10:00',
      });
    }
    setIsSlotModalOpen(true);
  };

  // Save slot
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotFormError(null);

    if (!slotForm.courseId || !slotForm.facultyId) {
      setSlotFormError('Please select both a course and a faculty member.');
      return;
    }

    if (slotForm.startTime >= slotForm.endTime) {
      setSlotFormError('Start time must be strictly before end time.');
      return;
    }

    try {
      if (editingSlot?.id) {
        await updateEntry.mutateAsync({
          id: editingSlot.id,
          data: {
            courseId: slotForm.courseId,
            facultyId: slotForm.facultyId,
            sectionId,
            roomId: slotForm.roomId || null,
            dayOfWeek: slotForm.dayOfWeek,
            startTime: slotForm.startTime,
            endTime: slotForm.endTime,
          },
        });
      } else {
        await createEntry.mutateAsync({
          termId: activeTermId,
          courseId: slotForm.courseId,
          facultyId: slotForm.facultyId,
          sectionId,
          roomId: slotForm.roomId || undefined,
          dayOfWeek: slotForm.dayOfWeek,
          startTime: slotForm.startTime,
          endTime: slotForm.endTime,
        });
      }
      refetch();
      setIsSlotModalOpen(false);
    } catch (err: any) {
      setSlotFormError(
        err?.response?.data?.message || err.message || 'Failed to save schedule slot.',
      );
    }
  };

  // Delete slot
  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to remove this timetable slot?')) return;
    try {
      await deleteEntry.mutateAsync(slotId);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to delete slot.');
    }
  };

  const displayedList =
    activeView === 'TODAY' ? todayEntries : activeView === 'SATURDAY' ? saturdayEntries : entries;

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="text-primary h-5 w-5" />
              Schedule & Flexible Timings
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {entries.length} Weekly Sessions
            </Badge>
          </div>
          <CardDescription className="mt-1">
            Manage section schedules, override current-day timings for emergencies, and configure
            flexible Saturday schedules.
          </CardDescription>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Term Selector */}
          {terms && terms.length > 1 && (
            <select
              value={activeTermId}
              onChange={(e) => onTermChange?.(e.target.value)}
              className="border-input bg-background h-8 rounded-md border px-2.5 text-xs font-medium"
            >
              {terms.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.code}
                </option>
              ))}
            </select>
          )}

          {/* Emergency / Shift Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/50 bg-amber-500/10 text-xs text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
            onClick={() => {
              setShiftTargetDay(currentDayOfWeek);
              setIsEmergencyModalOpen(true);
            }}
          >
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            Emergency Timing Override
          </Button>

          {/* Saturday Flexibility Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-primary/40 hover:bg-primary/10 text-xs"
            onClick={() => {
              setActiveView('SATURDAY');
              setIsSaturdayPresetOpen(true);
            }}
          >
            <SunMedium className="text-primary mr-1.5 h-3.5 w-3.5" />
            Flexible Saturday
          </Button>

          {/* Add Slot */}
          <Button
            variant="default"
            size="sm"
            className="text-xs"
            onClick={() => handleOpenSlotModal()}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Slot
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick View Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={activeView === 'TODAY' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveView('TODAY')}
            >
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Today ({currentDayOfWeek.charAt(0) + currentDayOfWeek.slice(1).toLowerCase()})
              <Badge variant="secondary" className="ml-1.5 px-1 py-0 text-[10px]">
                {todayEntries.length}
              </Badge>
            </Button>

            <Button
              variant={activeView === 'SATURDAY' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveView('SATURDAY')}
            >
              <SunMedium className="mr-1.5 h-3.5 w-3.5" />
              Saturday Schedule
              <Badge variant="secondary" className="ml-1.5 px-1 py-0 text-[10px]">
                {saturdayEntries.length}
              </Badge>
            </Button>

            <Button
              variant={activeView === 'ALL_WEEK' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveView('ALL_WEEK')}
            >
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              All Week ({entries.length})
            </Button>
          </div>

          {activeView === 'TODAY' && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>Current situation adjustments apply directly to today&apos;s schedule</span>
            </div>
          )}

          {activeView === 'SATURDAY' && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <SunMedium className="h-3.5 w-3.5" />
              <span>Saturday operates with customized flexible/half-day timings</span>
            </div>
          )}
        </div>

        {/* Schedule List / Table */}
        {isLoading ? (
          <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
            Loading timetable schedule...
          </div>
        ) : displayedList.length === 0 ? (
          <div className="bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <Clock className="text-muted-foreground/60 mb-2 h-8 w-8" />
            <p className="text-foreground text-sm font-medium">
              {activeView === 'TODAY'
                ? `No classes scheduled for today (${currentDayOfWeek}).`
                : activeView === 'SATURDAY'
                  ? 'No classes scheduled for Saturday yet.'
                  : 'No classes scheduled for this section.'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Use &quot;Add Slot&quot; to assign a class, or configure Saturday flexible timings.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() =>
                  handleOpenSlotModal(
                    undefined,
                    activeView === 'SATURDAY' ? 'SATURDAY' : currentDayOfWeek,
                  )
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Class Slot
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Day</th>
                  <th className="px-4 py-2.5">Course</th>
                  <th className="px-4 py-2.5">Faculty / Teacher</th>
                  <th className="px-4 py-2.5">Room</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {displayedList.map((slot: any) => {
                  const startTimeStr = formatDisplayTime(slot.startTime);
                  const endTimeStr = formatDisplayTime(slot.endTime);
                  const facultyName = slot.faculty?.user
                    ? `${slot.faculty.user.firstName} ${slot.faculty.user.lastName}`
                    : 'Faculty';
                  const roomName = slot.room?.name || slot.room?.number || 'Unassigned';

                  const isTodaySlot = slot.dayOfWeek === currentDayOfWeek;
                  const isSatSlot = slot.dayOfWeek === 'SATURDAY';

                  return (
                    <tr
                      key={slot.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isTodaySlot && activeView === 'TODAY'
                          ? 'bg-primary/5'
                          : isSatSlot && activeView === 'SATURDAY'
                            ? 'bg-amber-500/5'
                            : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="text-muted-foreground h-3.5 w-3.5" />
                          <span>
                            {startTimeStr} – {endTimeStr}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge
                          variant={
                            slot.dayOfWeek === 'SATURDAY'
                              ? 'secondary'
                              : isTodaySlot
                                ? 'default'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {slot.dayOfWeek}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground font-semibold">
                          {slot.course?.name || 'Course'}
                        </div>
                        {slot.course?.code && (
                          <div className="text-muted-foreground text-xs">{slot.course.code}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-foreground text-sm">{facultyName}</div>
                        {slot.faculty?.teacherCode && (
                          <div className="text-muted-foreground text-xs">
                            Code: {slot.faculty.teacherCode}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-muted-foreground text-xs">{roomName}</span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            title="Edit slot timing or classroom"
                            onClick={() => handleOpenSlotModal(slot)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
                            title="Delete slot"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Emergency / Current Day Timing Shift Modal */}
      <Dialog open={isEmergencyModalOpen} onOpenChange={setIsEmergencyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
              Emergency Schedule Timing Override
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Quickly shift all scheduled classes for a day due to severe weather, delay, emergency,
              or special assembly.
            </p>

            {modalMessage && (
              <div
                className={`flex items-center gap-2 rounded-md p-3 text-xs ${
                  modalMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {modalMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span>{modalMessage.text}</span>
              </div>
            )}

            {/* Target Day */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Select Day to Override</Label>
              <select
                value={shiftTargetDay}
                onChange={(e) => setShiftTargetDay(e.target.value as TimetableDayName)}
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1.5 text-sm"
              >
                {TIMETABLE_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d} {d === currentDayOfWeek ? '(Today)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Timing Adjustment (Delay / Advance)</Label>
              <select
                value={shiftMinutes}
                onChange={(e) => setShiftMinutes(parseInt(e.target.value, 10))}
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1.5 text-sm"
              >
                <option value={15}>Delay by +15 minutes</option>
                <option value={30}>Delay by +30 minutes</option>
                <option value={45}>Delay by +45 minutes</option>
                <option value={60}>Delay by +60 minutes (1 hour)</option>
                <option value={90}>Delay by +90 minutes (1.5 hours)</option>
                <option value={120}>Delay by +120 minutes (2 hours)</option>
                <option value={-15}>Advance by -15 minutes (earlier)</option>
                <option value={-30}>Advance by -30 minutes (earlier)</option>
                <option value={-60}>Advance by -60 minutes (earlier)</option>
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reason / Remarks (Optional)</Label>
              <Input
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                placeholder="e.g. Inclement Weather, Special Assembly"
                className="h-9 text-xs"
              />
            </div>

            <div className="bg-muted/40 rounded-md p-3 text-xs">
              <div className="flex items-center justify-between font-medium">
                <span>Classes to adjust:</span>
                <Badge variant="outline">
                  {entries.filter((e: any) => e.dayOfWeek === shiftTargetDay).length} classes
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={isShiftPending}
              onClick={() => setIsEmergencyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={isShiftPending}
              className="bg-amber-600 text-xs text-white hover:bg-amber-700"
              onClick={handleApplyDayShift}
            >
              {isShiftPending ? 'Applying Overrides...' : 'Apply Timing Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saturday Flexibility Preset Modal */}
      <Dialog open={isSaturdayPresetOpen} onOpenChange={setIsSaturdayPresetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SunMedium className="text-primary h-5 w-5" />
              Configure Saturday Flexible Timings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Customize Saturday hours independently from regular weekday schedules (e.g. half-day
              condensed periods or late start).
            </p>

            {/* Mode selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Saturday Schedule Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSaturdayMode('HALF_DAY')}
                  className={`flex flex-col items-start rounded-md border p-2.5 text-left transition-colors ${
                    saturdayMode === 'HALF_DAY'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <span className="text-xs font-semibold">Half-Day Condensed</span>
                  <span className="text-muted-foreground text-[11px]">
                    40-minute shortened periods
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSaturdayMode('CUSTOM')}
                  className={`flex flex-col items-start rounded-md border p-2.5 text-left transition-colors ${
                    saturdayMode === 'CUSTOM'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <span className="text-xs font-semibold">Custom Timings</span>
                  <span className="text-muted-foreground text-[11px]">
                    Custom start & slot length
                  </span>
                </button>
              </div>
            </div>

            {/* Start Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Saturday Start Time</Label>
                <Input
                  type="time"
                  value={satStartTime}
                  onChange={(e) => setSatStartTime(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Period Duration</Label>
                <Input
                  type="number"
                  min={20}
                  max={90}
                  step={5}
                  value={saturdayMode === 'HALF_DAY' ? 40 : satDuration}
                  disabled={saturdayMode === 'HALF_DAY'}
                  onChange={(e) => setSatDuration(parseInt(e.target.value, 10) || 45)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="bg-muted/40 space-y-1 rounded-md p-3 text-xs">
              <div className="flex justify-between font-medium">
                <span>Saturday classes to realign:</span>
                <Badge variant="outline">{saturdayEntries.length} classes</Badge>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Applies sequentially starting from {satStartTime} with 10-minute intervals between
                classes.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              disabled={isShiftPending}
              onClick={() => setIsSaturdayPresetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={isShiftPending}
              className="text-xs"
              onClick={handleApplySaturdayPreset}
            >
              {isShiftPending ? 'Applying...' : 'Apply Saturday Timings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Individual Slot Create / Edit Modal */}
      <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              {editingSlot?.id ? 'Edit Class Slot' : 'Add Class Slot'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSlot} className="space-y-3 py-2">
            {slotFormError && (
              <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md p-2.5 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{slotFormError}</span>
              </div>
            )}

            {/* Course */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Course *</Label>
              <select
                required
                value={slotForm.courseId}
                onChange={(e) => setSlotForm((prev) => ({ ...prev, courseId: e.target.value }))}
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
              >
                <option value="">Select Course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Faculty */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Faculty Member *</Label>
              <select
                required
                value={slotForm.facultyId}
                onChange={(e) => setSlotForm((prev) => ({ ...prev, facultyId: e.target.value }))}
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
              >
                <option value="">Select Faculty...</option>
                {facultyList.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.user?.firstName} {f.user?.lastName} ({f.teacherCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Day of Week *</Label>
              <select
                value={slotForm.dayOfWeek}
                onChange={(e) =>
                  setSlotForm((prev) => ({
                    ...prev,
                    dayOfWeek: e.target.value as TimetableDayName,
                  }))
                }
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
              >
                {TIMETABLE_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 'SATURDAY' ? '(Flexible Saturday)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Start and End Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Start Time *</Label>
                <Input
                  type="time"
                  required
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">End Time *</Label>
                <Input
                  type="time"
                  required
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Classroom */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Classroom / Room (Optional)</Label>
              <select
                value={slotForm.roomId}
                onChange={(e) => setSlotForm((prev) => ({ ...prev, roomId: e.target.value }))}
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
              >
                <option value="">Select Room (or leave unassigned)...</option>
                {roomsList.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.number} ({r.roomType || 'Room'})
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSlotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createEntry.isPending || updateEntry.isPending}
              >
                {createEntry.isPending || updateEntry.isPending ? 'Saving...' : 'Save Slot'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
