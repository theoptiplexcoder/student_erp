'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useInstitutionSettings } from '@/hooks/api/admin/useInstitutionSettings';
import { useAdminRooms } from '@/hooks/api/admin/useRooms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Input,
  Label,
  Button,
  Checkbox,
  Badge,
} from '@student-erp/ui';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  isPractical: boolean;
}

interface Section {
  id: string;
  name: string;
  code?: string;
  programId?: string;
}

interface Program {
  id: string;
  name: string;
  code?: string;
}

export interface TimetableGenerationConfig {
  termId: string;
  sectionIds: string[];
  days: string[];
  workingHours: { start: string; end: string };
  breakPeriods: { start: string; end: string }[];
  defaultSessionDuration: number;
  sessionDurations: Record<string, number>;
  selectedRoomIds?: string[];
}

interface TimetableGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYearName?: string;
  termName?: string;
  termId: string;
  programs: Program[];
  allSections: Section[];
  scopedSections: Section[];
  selectedProgramId: string;
  selectedSectionId: string;
  courses: Course[];
  existingSessionCount?: number;
  onConfirm: (config: TimetableGenerationConfig) => void;
}

const ALL_DAYS = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
];

export function TimetableGenerationModal({
  open,
  onOpenChange,
  academicYearName,
  termName,
  termId,
  programs,
  allSections,
  scopedSections,
  selectedProgramId,
  selectedSectionId,
  courses,
  existingSessionCount = 0,
  onConfirm,
}: TimetableGenerationModalProps) {
  const { data: institutionSettings } = useInstitutionSettings();
  const { data: roomsResponse } = useAdminRooms(1, 100);
  const rooms = roomsResponse?.data || [];

  const institutionStartTime = institutionSettings?.startTime || '08:00';
  const institutionClosingTime = institutionSettings?.closingTime || '17:00';

  // Section scope state: 'all' | 'program' | 'custom'
  const [scopeMode, setScopeMode] = useState<'all' | 'program' | 'custom'>('all');
  const [targetProgramId, setTargetProgramId] = useState<string>('');
  const [customSelectedSectionIds, setCustomSelectedSectionIds] = useState<string[]>([]);

  // Generation preferences
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ]);
  const [workingHoursStart, setWorkingHoursStart] = useState('08:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('17:00');
  const [defaultDuration, setDefaultDuration] = useState(50);
  const [breakPeriods, setBreakPeriods] = useState<{ start: string; end: string }[]>([
    { start: '13:00', end: '14:00' },
  ]);
  const [hasBreak, setHasBreak] = useState(true);

  // Overrides & Rooms collapsible
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  // Reset defaults when opening modal
  useEffect(() => {
    if (open) {
      setWorkingHoursStart(institutionStartTime);
      setWorkingHoursEnd(institutionClosingTime);
      setDefaultDuration(50);
      setSelectedDays(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);
      setBreakPeriods([{ start: '13:00', end: '14:00' }]);
      setHasBreak(true);
      setShowAdvanced(false);

      if (selectedSectionId) {
        setScopeMode('custom');
        setCustomSelectedSectionIds([selectedSectionId]);
      } else if (selectedProgramId) {
        setScopeMode('program');
        setTargetProgramId(selectedProgramId);
      } else {
        setScopeMode('all');
      }

      const initialDurations: Record<string, number> = {};
      courses.forEach((c) => {
        initialDurations[c.id] = 50;
      });
      setDurations(initialDurations);
      setOverrides({});
      if (rooms.length > 0) {
        setSelectedRoomIds(rooms.map((r) => r.id));
      }
    }
  }, [
    open,
    institutionStartTime,
    institutionClosingTime,
    selectedProgramId,
    selectedSectionId,
    courses,
    rooms,
  ]);

  // Determine computed target sections based on scope
  const targetSections = useMemo(() => {
    if (scopeMode === 'all') {
      return scopedSections.length > 0 ? scopedSections : allSections;
    }
    if (scopeMode === 'program') {
      const pId = targetProgramId || selectedProgramId;
      if (!pId) return scopedSections;
      return allSections.filter((s: any) => s.programId === pId || s.program?.id === pId);
    }
    if (scopeMode === 'custom') {
      return allSections.filter((s) => customSelectedSectionIds.includes(s.id));
    }
    return scopedSections;
  }, [
    scopeMode,
    scopedSections,
    allSections,
    targetProgramId,
    selectedProgramId,
    customSelectedSectionIds,
  ]);

  const toggleDay = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayKey));
      }
    } else {
      setSelectedDays([...selectedDays, dayKey]);
    }
  };

  const handleOverrideToggle = (courseId: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (next[courseId]) {
        delete next[courseId];
      } else {
        next[courseId] = true;
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const sectionIds = targetSections.map((s) => s.id);
    if (sectionIds.length === 0) {
      alert('Please select at least one section to generate the timetable.');
      return;
    }

    const sessionDurations: Record<string, number> = {};
    courses.forEach((c) => {
      if (overrides[c.id]) {
        sessionDurations[c.id] = durations[c.id] ?? defaultDuration;
      }
    });

    const activeBreakPeriods = hasBreak ? breakPeriods : [];

    onConfirm({
      termId,
      sectionIds,
      days: selectedDays,
      workingHours: { start: workingHoursStart, end: workingHoursEnd },
      breakPeriods: activeBreakPeriods,
      defaultSessionDuration: defaultDuration,
      sessionDurations,
      selectedRoomIds: selectedRoomIds.length > 0 ? selectedRoomIds : undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Generate Timetable</DialogTitle>
              <DialogDescription className="text-xs">
                Auto-generate conflict-free schedules utilizing existing faculty, section, and
                course assignments.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 1. Academic Scope Banner */}
          <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-xs">
            <div>
              <span className="text-muted-foreground">Target Term: </span>
              <span className="font-semibold">{termName || 'Selected Term'}</span>
              {academicYearName && (
                <span className="text-muted-foreground"> ({academicYearName})</span>
              )}
            </div>
            <Badge variant="outline" className="font-medium">
              {targetSections.length} {targetSections.length === 1 ? 'Section' : 'Sections'} In
              Scope
            </Badge>
          </div>

          {/* 2. Section Scope Selection */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Sections to Schedule
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScopeMode('all')}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
                  scopeMode === 'all'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <Layers className="mb-1 h-4 w-4" />
                <span className="text-xs">All Sections</span>
                <span className="text-[10px] opacity-75">
                  ({scopedSections.length || allSections.length} available)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScopeMode('program');
                  if (!targetProgramId && programs.length > 0) {
                    setTargetProgramId(selectedProgramId || programs[0].id);
                  }
                }}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
                  scopeMode === 'program'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <Calendar className="mb-1 h-4 w-4" />
                <span className="text-xs">By Program</span>
                <span className="text-[10px] opacity-75">Target whole program</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScopeMode('custom');
                  if (customSelectedSectionIds.length === 0 && allSections.length > 0) {
                    setCustomSelectedSectionIds([allSections[0].id]);
                  }
                }}
                className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all ${
                  scopeMode === 'custom'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                <CheckCircle2 className="mb-1 h-4 w-4" />
                <span className="text-xs">Specific Sections</span>
                <span className="text-[10px] opacity-75">
                  ({customSelectedSectionIds.length} selected)
                </span>
              </button>
            </div>

            {/* Scope Details Dropdown / Pickers */}
            {scopeMode === 'program' && (
              <div className="mt-2">
                <Label htmlFor="program-picker" className="text-xs">
                  Choose Program
                </Label>
                <select
                  id="program-picker"
                  value={targetProgramId || selectedProgramId}
                  onChange={(e) => setTargetProgramId(e.target.value)}
                  className="border-input bg-background mt-1 flex h-9 w-full rounded-md border px-3 py-1.5 text-xs"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.code ? `(${p.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scopeMode === 'custom' && (
              <div className="bg-muted/20 mt-2 max-h-36 space-y-1 overflow-y-auto rounded-lg border p-2">
                {allSections.map((sec) => {
                  const checked = customSelectedSectionIds.includes(sec.id);
                  return (
                    <label
                      key={sec.id}
                      className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded p-1.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) => {
                            if (val) {
                              setCustomSelectedSectionIds([...customSelectedSectionIds, sec.id]);
                            } else {
                              setCustomSelectedSectionIds(
                                customSelectedSectionIds.filter((id) => id !== sec.id),
                              );
                            }
                          }}
                        />
                        <span className="font-medium">{sec.name}</span>
                        {sec.code && <span className="text-muted-foreground">({sec.code})</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Working Days & Timings */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Working Days
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_DAYS.map((d) => {
                  const active = selectedDays.includes(d.key);
                  return (
                    <Button
                      key={d.key}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(d.key)}
                      className="h-8 px-2.5 text-xs"
                    >
                      {d.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Daily Hours
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  className="h-8 text-xs"
                />
                <span className="text-muted-foreground text-xs">to</span>
                <Input
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 4. Session Duration & Break Period */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Period Duration (minutes)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={15}
                  max={180}
                  step={5}
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(parseInt(e.target.value, 10) || 50)}
                  className="h-8 text-xs"
                />
                <span className="text-muted-foreground text-xs">mins / period</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Break / Lunch Window
                </Label>
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id="has-break-toggle"
                    checked={hasBreak}
                    onCheckedChange={(val) => setHasBreak(!!val)}
                    className="h-3.5 w-3.5"
                  />
                  <label
                    htmlFor="has-break-toggle"
                    className="text-muted-foreground cursor-pointer text-[11px]"
                  >
                    Protect Break
                  </label>
                </div>
              </div>
              {hasBreak ? (
                <div className="space-y-2">
                  {breakPeriods.map((period, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        aria-label={`Break ${index + 1} start`}
                        type="time"
                        value={period.start}
                        onChange={(e) =>
                          setBreakPeriods((current) =>
                            current.map((item, i) =>
                              i === index ? { ...item, start: e.target.value } : item,
                            ),
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <span className="text-muted-foreground text-xs">to</span>
                      <Input
                        aria-label={`Break ${index + 1} end`}
                        type="time"
                        value={period.end}
                        onChange={(e) =>
                          setBreakPeriods((current) =>
                            current.map((item, i) =>
                              i === index ? { ...item, end: e.target.value } : item,
                            ),
                          )
                        }
                        className="h-8 text-xs"
                      />
                      {breakPeriods.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setBreakPeriods((current) => current.filter((_, i) => i !== index))
                          }
                          aria-label={`Remove break ${index + 1}`}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setBreakPeriods((current) => [...current, { start: '15:00', end: '15:15' }])
                    }
                  >
                    Add break
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs italic">No break period scheduled</p>
              )}
            </div>
          </div>

          {/* 5. Advanced Constraints & Per-Course Durations */}
          <div className="border-t pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium"
            >
              <span>
                {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings & Overrides'}
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showAdvanced && (
              <div className="bg-muted/20 mt-3 space-y-4 rounded-lg border p-3">
                {/* Rooms selection */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Available Rooms ({rooms.length})
                    </Label>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRoomIds(
                          selectedRoomIds.length === rooms.length ? [] : rooms.map((r) => r.id),
                        )
                      }
                      className="text-primary text-[11px] hover:underline"
                    >
                      {selectedRoomIds.length === rooms.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="mt-1 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                    {rooms.map((room) => {
                      const active = selectedRoomIds.includes(room.id);
                      return (
                        <Badge
                          key={room.id}
                          variant={active ? 'default' : 'outline'}
                          className="cursor-pointer text-[10px]"
                          onClick={() => {
                            if (active) {
                              setSelectedRoomIds(selectedRoomIds.filter((id) => id !== room.id));
                            } else {
                              setSelectedRoomIds([...selectedRoomIds, room.id]);
                            }
                          }}
                        >
                          {room.name || room.number} ({room.roomType})
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Per-Course session overrides */}
                {courses.length > 0 && (
                  <div>
                    <Label className="text-xs font-semibold">Per-Course Duration Overrides</Label>
                    <div className="mt-1 max-h-36 overflow-y-auto rounded border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 border-b text-left">
                            <th className="p-1.5 font-medium">Course</th>
                            <th className="p-1.5 text-center font-medium">Override Mins</th>
                            <th className="p-1.5 text-center font-medium">Enable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map((c) => {
                            const isEnabled = !!overrides[c.id];
                            return (
                              <tr key={c.id} className="border-b last:border-0">
                                <td className="p-1.5">
                                  <span className="font-semibold">{c.code}</span> - {c.name}
                                </td>
                                <td className="p-1.5 text-center">
                                  <Input
                                    type="number"
                                    min={15}
                                    max={180}
                                    step={15}
                                    value={durations[c.id] ?? defaultDuration}
                                    disabled={!isEnabled}
                                    onChange={(e) =>
                                      setDurations({
                                        ...durations,
                                        [c.id]: parseInt(e.target.value, 10) || 50,
                                      })
                                    }
                                    className="mx-auto h-7 w-16 text-center text-xs"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <Checkbox
                                    checked={isEnabled}
                                    onCheckedChange={() => handleOverrideToggle(c.id)}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={targetSections.length === 0}
            className="gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            Generate for {targetSections.length}{' '}
            {targetSections.length === 1 ? 'Section' : 'Sections'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
