'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Button,
  Checkbox,
} from '@student-erp/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  isPractical: boolean;
}

interface TimetableSessionSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (settings: { defaultSessionDuration: number; sessionDurations: Record<string, number> }) => void;
  courses: Course[];
}

export function TimetableSessionSettings({
  open,
  onOpenChange,
  onConfirm,
  courses,
}: TimetableSessionSettingsProps) {
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [showPerCourse, setShowPerCourse] = useState(false);

  // Reset to defaults when dialog opens
  useEffect(() => {
    if (open) {
      setDefaultDuration(60);
      setOverrides({});
      const initialDurations: Record<string, number> = {};
      courses.forEach((c) => {
        initialDurations[c.id] = 60;
      });
      setDurations(initialDurations);
      setShowPerCourse(false);
    }
  }, [open, courses]);

  const handleDefaultDurationChange = (value: number) => {
    const clamped = Math.min(180, Math.max(15, value));
    setDefaultDuration(clamped);
    // Update durations for courses that don't have an override enabled
    const updated = { ...durations };
    courses.forEach((c) => {
      if (!overrides[c.id]) {
        updated[c.id] = clamped;
      }
    });
    setDurations(updated);
  };

  const handleOverrideToggle = (courseId: string) => {
    const newOverrides = { ...overrides };
    const newDurations = { ...durations };

    if (newOverrides[courseId]) {
      delete newOverrides[courseId];
      newDurations[courseId] = defaultDuration;
    } else {
      newOverrides[courseId] = true;
      if (!newDurations[courseId] || newDurations[courseId] === defaultDuration) {
        newDurations[courseId] = defaultDuration;
      }
    }

    setOverrides(newOverrides);
    setDurations(newDurations);
  };

  const handleDurationChange = (courseId: string, value: number) => {
    const clamped = Math.min(180, Math.max(15, value));
    setDurations({ ...durations, [courseId]: clamped });
  };

  const handleApply = () => {
    const sessionDurations: Record<string, number> = {};
    courses.forEach((c) => {
      if (overrides[c.id]) {
        sessionDurations[c.id] = durations[c.id] ?? defaultDuration;
      }
    });

    onConfirm({
      defaultSessionDuration: defaultDuration,
      sessionDurations,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Session Duration Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-duration">Default Session Duration (minutes)</Label>
            <Input
              id="default-duration"
              type="number"
              min={15}
              max={180}
              step={15}
              value={defaultDuration}
              onChange={(e) => handleDefaultDurationChange(parseInt(e.target.value, 10) || 15)}
            />
          </div>

          {courses.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
                onClick={() => setShowPerCourse(!showPerCourse)}
              >
                Per-Course Overrides
                {showPerCourse ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showPerCourse && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium">Course</th>
                        <th className="px-3 py-2 text-center font-medium w-16">Credits</th>
                        <th className="px-3 py-2 text-center font-medium w-24">Minutes</th>
                        <th className="px-3 py-2 text-center font-medium w-12">Use</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => {
                        const isEnabled = !!overrides[course.id];
                        return (
                          <tr key={course.id} className="border-b last:border-0">
                            <td className="px-3 py-2">
                              <div className="font-medium">{course.code}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">{course.name}</div>
                            </td>
                            <td className="px-3 py-2 text-center">{course.credits}</td>
                            <td className="px-3 py-2 text-center">
                              <Input
                                type="number"
                                min={15}
                                max={180}
                                step={15}
                                value={durations[course.id] ?? defaultDuration}
                                onChange={(e) => handleDurationChange(course.id, parseInt(e.target.value, 10) || 15)}
                                disabled={!isEnabled}
                                className="h-8 w-20 text-center mx-auto"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <Checkbox
                                checked={isEnabled}
                                onCheckedChange={() => handleOverrideToggle(course.id)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
