'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@student-erp/ui';
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, Layers, Calendar } from 'lucide-react';

export interface GenerationProgressState {
  totalSections: number;
  completedSections: number;
  currentSectionName?: string;
  isCompleted: boolean;
}

export interface GenerationResultSummary {
  sectionsProcessed: number;
  sessionsGenerated: number;
  conflictsFound: number;
  sectionsRequiringAdjustment: number;
  firstGeneratedSectionId?: string;
  firstGeneratedProgramId?: string;
  details?: {
    facultyConflicts?: number;
    roomConflicts?: number;
    sectionConflicts?: number;
    unscheduledSessions?: number;
  };
}

interface TimetableGenerationProgressBannerProps {
  isGenerating: boolean;
  totalSections: number;
  sectionNames?: string[];
  summary: GenerationResultSummary | null;
  onDismissSummary?: () => void;
  onViewGenerated?: (sectionId?: string, programId?: string) => void;
}

export function TimetableGenerationProgressBanner({
  isGenerating,
  totalSections,
  sectionNames = [],
  summary,
  onDismissSummary,
  onViewGenerated,
}: TimetableGenerationProgressBannerProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const [currentSection, setCurrentSection] = useState('');

  // Animated section ticker during generation
  useEffect(() => {
    if (!isGenerating) {
      setCompletedCount(0);
      setCurrentSection('');
      return;
    }

    setCompletedCount(0);
    const count = Math.max(1, totalSections);
    const intervalTime = Math.max(80, Math.min(400, 3000 / count));

    const interval = setInterval(() => {
      setCompletedCount((prev) => {
        if (prev >= count - 1) {
          clearInterval(interval);
          return count - 1;
        }
        const next = prev + 1;
        if (sectionNames[next]) {
          setCurrentSection(sectionNames[next]);
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isGenerating, totalSections, sectionNames]);

  if (isGenerating) {
    const percent = Math.min(95, Math.round((completedCount / Math.max(1, totalSections)) * 100));

    return (
      <Card className="border-primary/40 bg-primary/5 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Loader2 className="text-primary h-5 w-5 animate-spin" />
                <div>
                  <h3 className="text-foreground text-sm font-semibold">
                    Generating timetable for {totalSections} section{totalSections !== 1 ? 's' : ''}
                    ...
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {completedCount} / {totalSections} completed
                    {currentSection ? ` &bull; Processing Section ${currentSection}` : ''}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {percent}%
              </Badge>
            </div>

            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (summary) {
    const hasConflicts = summary.conflictsFound > 0;

    return (
      <Card
        className={`shadow-sm transition-all ${
          hasConflicts
            ? 'border-amber-300 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30'
            : 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30'
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {hasConflicts ? (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              ) : (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
              <div>
                <h4 className="text-foreground text-sm font-bold">
                  {hasConflicts
                    ? 'Timetable Generated with Review Items'
                    : 'Timetable Generated Successfully'}
                </h4>
                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span>
                    <strong className="text-foreground">{summary.sectionsProcessed}</strong>{' '}
                    Sections Processed
                  </span>
                  <span>&bull;</span>
                  <span>
                    <strong className="text-foreground">{summary.sessionsGenerated}</strong>{' '}
                    Sessions Generated
                  </span>
                  <span>&bull;</span>
                  <span
                    className={
                      hasConflicts ? 'font-semibold text-amber-700 dark:text-amber-300' : ''
                    }
                  >
                    <strong>{summary.conflictsFound}</strong> Conflict
                    {summary.conflictsFound !== 1 ? 's' : ''} Found
                  </span>
                  <span>&bull;</span>
                  <span>
                    <strong className="text-foreground">
                      {summary.sectionsRequiringAdjustment}
                    </strong>{' '}
                    Section{summary.sectionsRequiringAdjustment !== 1 ? 's' : ''} Requiring Manual
                    Adjustment
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {onViewGenerated && summary.sessionsGenerated > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onViewGenerated(
                      summary.firstGeneratedSectionId,
                      summary.firstGeneratedProgramId,
                    )
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
                >
                  View Weekly Grid
                </button>
              )}
              {onDismissSummary && (
                <button
                  type="button"
                  onClick={onDismissSummary}
                  className="text-muted-foreground px-2 py-1 text-xs hover:underline"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
