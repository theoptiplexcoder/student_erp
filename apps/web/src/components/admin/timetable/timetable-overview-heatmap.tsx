'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@student-erp/ui';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  GraduationCap,
  Layers,
  ArrowRight,
  Filter,
  BarChart3,
  Info,
  Sparkles,
} from 'lucide-react';
import { Section } from '@/hooks/api/admin/useSections';
import {
  findTimetableConflicts,
  TimetableConflict,
} from '@/components/admin/timetable/timetable-conflict-utils';

export interface TimetableAnalyticsProps {
  programs: Array<{ id: string; name: string; code?: string }>;
  sections: Section[];
  entries: any[];
  onSelectSectionAndProgram: (programId: string, sectionId: string) => void;
  onGenerateClick?: () => void;
  hasTermSelected: boolean;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
const DAY_SHORT: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
};

// Target weekly academic slots typical for higher ed (30 slots = 6 periods * 5 days or similar)
const TARGET_WEEKLY_SLOTS = 30;

export interface SectionAnalysis {
  section: Section;
  programId: string;
  programName: string;
  programCode?: string;
  entries: any[];
  totalSlots: number;
  conflicts: TimetableConflict[];
  conflictCount: number;
  dayDistribution: Record<string, number>;
  activeDaysCount: number;
  maxDaySlots: number;
  minDaySlots: number;
  dayImbalance: number; // maxDaySlots - minDaySlots among active days
  assignedCoursesCount: number;
  scheduledCoursesCount: number;
  courseCoverageRate: number; // percentage (0-100)
  feasibilityScore: number; // 0 - 100
  feasibilityStatus: 'EXCELLENT' | 'FEASIBLE' | 'ATTENTION' | 'CRITICAL' | 'UNSCHEDULED';
  flags: string[];
}

export function TimetableOverviewHeatmap({
  programs,
  sections,
  entries,
  onSelectSectionAndProgram,
  onGenerateClick,
  hasTermSelected,
}: TimetableAnalyticsProps) {
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'CRITICAL' | 'ATTENTION' | 'FEASIBLE' | 'UNSCHEDULED'
  >('ALL');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'status' | 'conflicts' | 'utilization' | 'name'>('status');

  // Map program info
  const programMap = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code?: string }>();
    programs.forEach((p) => map.set(p.id, p));
    return map;
  }, [programs]);

  // Group entries by section
  const entriesBySection = useMemo(() => {
    const map = new Map<string, any[]>();
    entries.forEach((e) => {
      const secId = e.sectionId || e.section?.id;
      if (!secId) return;
      if (!map.has(secId)) map.set(secId, []);
      map.get(secId)!.push(e);
    });
    return map;
  }, [entries]);

  // Analyze each section
  const sectionAnalyses = useMemo<SectionAnalysis[]>(() => {
    return sections.map((sec) => {
      const secEntries = entriesBySection.get(sec.id) || [];
      const progId = sec.program?.id || (sec as any).programId || '';
      const prog: { id: string; name: string; code?: string } = programMap.get(progId) ||
        sec.program || { id: progId, name: 'General', code: undefined };

      // Compute conflicts for this section
      const secConflicts = findTimetableConflicts(secEntries);

      // Day slot distribution
      const dayDistribution: Record<string, number> = {
        MONDAY: 0,
        TUESDAY: 0,
        WEDNESDAY: 0,
        THURSDAY: 0,
        FRIDAY: 0,
        SATURDAY: 0,
      };

      secEntries.forEach((e) => {
        const d = (e.dayOfWeek || '').toUpperCase();
        if (dayDistribution[d] !== undefined) {
          dayDistribution[d]++;
        }
      });

      const dayCounts = Object.values(dayDistribution);
      const activeDays = dayCounts.filter((c) => c > 0);
      const maxDaySlots = activeDays.length > 0 ? Math.max(...activeDays) : 0;
      const minDaySlots = activeDays.length > 0 ? Math.min(...activeDays) : 0;
      const dayImbalance = maxDaySlots - minDaySlots;

      // Course coverage: how many assigned courses actually have at least 1 timetable entry?
      const assignedCourses = sec.courseAssignments || [];
      const assignedCourseIds = new Set(assignedCourses.map((ca) => ca.course.id));
      const scheduledCourseIds = new Set<string>();
      secEntries.forEach((e) => {
        const cId = e.courseId || e.course?.id || e.courseOffering?.course?.id;
        if (cId) scheduledCourseIds.add(cId);
      });

      let scheduledAssignedCount = 0;
      assignedCourseIds.forEach((cId) => {
        if (scheduledCourseIds.has(cId)) scheduledAssignedCount++;
      });

      const courseCoverageRate =
        assignedCourseIds.size > 0
          ? Math.round((scheduledAssignedCount / assignedCourseIds.size) * 100)
          : secEntries.length > 0
            ? 100
            : 0;

      // Determine feasibility score & issues
      const flags: string[] = [];
      let score = 100;

      if (secEntries.length === 0) {
        score = 0;
        flags.push('No schedule generated');
      } else {
        // Severe penalty for conflicts
        if (secConflicts.length > 0) {
          score -= Math.min(secConflicts.length * 25, 60);
          flags.push(
            `${secConflicts.length} schedule conflict${secConflicts.length > 1 ? 's' : ''}`,
          );
        }

        // Daily overload check (> 7 periods a day)
        if (maxDaySlots >= 8) {
          score -= 15;
          flags.push(`Heavy daily overload (${maxDaySlots} slots in a day)`);
        }

        // Daily imbalance
        if (dayImbalance >= 4) {
          score -= 10;
          flags.push(`Uneven weekly load (spread varies by ${dayImbalance} slots)`);
        }

        // Low weekly density (< 15 slots)
        if (secEntries.length < 15) {
          score -= 15;
          flags.push(`Low total volume (${secEntries.length} weekly slots)`);
        }

        // Missing courses
        if (assignedCourseIds.size > 0 && scheduledAssignedCount < assignedCourseIds.size) {
          const missing = assignedCourseIds.size - scheduledAssignedCount;
          score -= Math.min(missing * 10, 30);
          flags.push(`${missing} assigned course${missing > 1 ? 's' : ''} not scheduled`);
        }
      }

      score = Math.max(0, Math.min(100, score));

      let feasibilityStatus: SectionAnalysis['feasibilityStatus'] = 'EXCELLENT';
      if (secEntries.length === 0) {
        feasibilityStatus = 'UNSCHEDULED';
      } else if (secConflicts.length > 0 || score < 50) {
        feasibilityStatus = 'CRITICAL';
      } else if (score < 80) {
        feasibilityStatus = 'ATTENTION';
      } else if (score < 95) {
        feasibilityStatus = 'FEASIBLE';
      }

      return {
        section: sec,
        programId: progId,
        programName: prog.name || 'General',
        programCode: prog.code,
        entries: secEntries,
        totalSlots: secEntries.length,
        conflicts: secConflicts,
        conflictCount: secConflicts.length,
        dayDistribution,
        activeDaysCount: activeDays.length,
        maxDaySlots,
        minDaySlots,
        dayImbalance,
        assignedCoursesCount: assignedCourseIds.size,
        scheduledCoursesCount: scheduledAssignedCount,
        courseCoverageRate,
        feasibilityScore: score,
        feasibilityStatus,
        flags,
      };
    });
  }, [sections, entriesBySection, programMap]);

  // Overall KPIs
  const kpis = useMemo(() => {
    const totalSections = sectionAnalyses.length;
    const scheduledSections = sectionAnalyses.filter((s) => s.totalSlots > 0).length;
    const criticalSections = sectionAnalyses.filter(
      (s) => s.feasibilityStatus === 'CRITICAL',
    ).length;
    const attentionSections = sectionAnalyses.filter(
      (s) => s.feasibilityStatus === 'ATTENTION',
    ).length;
    const optimalSections = sectionAnalyses.filter(
      (s) => s.feasibilityStatus === 'FEASIBLE' || s.feasibilityStatus === 'EXCELLENT',
    ).length;
    const unscheduledSections = sectionAnalyses.filter(
      (s) => s.feasibilityStatus === 'UNSCHEDULED',
    ).length;

    const avgScore =
      scheduledSections > 0
        ? Math.round(
            sectionAnalyses
              .filter((s) => s.totalSlots > 0)
              .reduce((acc, curr) => acc + curr.feasibilityScore, 0) / scheduledSections,
          )
        : 0;

    const totalConflicts = sectionAnalyses.reduce((acc, curr) => acc + curr.conflictCount, 0);

    return {
      totalSections,
      scheduledSections,
      criticalSections,
      attentionSections,
      optimalSections,
      unscheduledSections,
      avgScore,
      totalConflicts,
    };
  }, [sectionAnalyses]);

  // Filtered & Sorted sections
  const displayedSections = useMemo(() => {
    let list = [...sectionAnalyses];

    if (selectedProgramFilter !== 'ALL') {
      list = list.filter((s) => s.programId === selectedProgramFilter);
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'FEASIBLE') {
        list = list.filter(
          (s) => s.feasibilityStatus === 'FEASIBLE' || s.feasibilityStatus === 'EXCELLENT',
        );
      } else {
        list = list.filter((s) => s.feasibilityStatus === statusFilter);
      }
    }

    list.sort((a, b) => {
      if (sortBy === 'status') {
        const order: Record<SectionAnalysis['feasibilityStatus'], number> = {
          CRITICAL: 0,
          ATTENTION: 1,
          UNSCHEDULED: 2,
          FEASIBLE: 3,
          EXCELLENT: 4,
        };
        return (
          order[a.feasibilityStatus] - order[b.feasibilityStatus] ||
          b.conflictCount - a.conflictCount
        );
      }
      if (sortBy === 'conflicts') {
        return b.conflictCount - a.conflictCount;
      }
      if (sortBy === 'utilization') {
        return b.totalSlots - a.totalSlots;
      }
      return a.section.name.localeCompare(b.section.name);
    });

    return list;
  }, [sectionAnalyses, selectedProgramFilter, statusFilter, sortBy]);

  // Intensity color helper for heatmap cells (0 to 8+ slots)
  const getSlotIntensityClass = (count: number) => {
    if (count === 0) return 'bg-muted/30 text-muted-foreground/40 border-muted/50';
    if (count <= 2)
      return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900';
    if (count <= 4)
      return 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900';
    if (count <= 6)
      return 'bg-teal-200 text-teal-950 border-teal-300 dark:bg-teal-900/50 dark:text-teal-200 dark:border-teal-800 font-semibold';
    if (count <= 7)
      return 'bg-amber-200 text-amber-950 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800 font-semibold';
    // Overload (8+ slots in 1 day)
    return 'bg-red-200 text-red-950 border-red-300 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800 font-bold';
  };

  return (
    <Card className="border-border bg-card shadow-sm transition-all">
      <CardHeader className="p-4 pb-3 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold sm:text-lg">
                  Multi-Program Timetable Feasibility Heatmap
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  All Programs Overview
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Real-time cross-section load distribution, conflicts, and feasibility index.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onGenerateClick && (
              <Button
                size="sm"
                onClick={onGenerateClick}
                disabled={!hasTermSelected || sections.length === 0}
                className="gap-1.5 text-xs font-medium"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate / Optimize
              </Button>
            )}
          </div>
        </div>

        {/* High-level KPI Summary strip */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          <div className="border-border bg-muted/20 rounded-lg border p-2.5 sm:p-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5" />
              <span>Total Sections</span>
            </div>
            <div className="mt-1 text-lg font-bold sm:text-xl">{kpis.totalSections}</div>
            <div className="text-muted-foreground text-[10px]">
              {kpis.scheduledSections} scheduled (
              {Math.round((kpis.scheduledSections / Math.max(1, kpis.totalSections)) * 100)}%)
            </div>
          </div>

          <div className="border-border bg-muted/20 rounded-lg border p-2.5 sm:p-3">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Feasibility Index</span>
            </div>
            <div
              className={`mt-1 text-lg font-bold sm:text-xl ${kpis.avgScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : kpis.avgScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}
            >
              {kpis.avgScore}%
            </div>
            <div className="text-muted-foreground text-[10px]">Avg health across active</div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
            className={`cursor-pointer rounded-lg border p-2.5 transition-colors sm:p-3 ${statusFilter === 'CRITICAL' ? 'border-red-500 bg-red-100/50 dark:bg-red-950/50' : 'border-red-200 bg-red-50/50 hover:bg-red-100/40 dark:border-red-900/60 dark:bg-red-950/20'}`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              <span>Critical / Clashing</span>
            </div>
            <div className="mt-1 text-lg font-bold text-red-700 sm:text-xl dark:text-red-300">
              {kpis.criticalSections}
            </div>
            <div className="text-[10px] text-red-600 dark:text-red-400">
              {kpis.totalConflicts} total collisions
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'ATTENTION' ? 'ALL' : 'ATTENTION')}
            className={`cursor-pointer rounded-lg border p-2.5 transition-colors sm:p-3 ${statusFilter === 'ATTENTION' ? 'border-amber-500 bg-amber-100/50 dark:bg-amber-950/50' : 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/40 dark:border-amber-900/60 dark:bg-amber-950/20'}`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Needs Attention</span>
            </div>
            <div className="mt-1 text-lg font-bold text-amber-700 sm:text-xl dark:text-amber-300">
              {kpis.attentionSections}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400">
              Load imbalance or partial
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'FEASIBLE' ? 'ALL' : 'FEASIBLE')}
            className={`cursor-pointer rounded-lg border p-2.5 transition-colors sm:p-3 ${statusFilter === 'FEASIBLE' ? 'border-emerald-500 bg-emerald-100/50 dark:bg-emerald-950/50' : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'}`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Feasible / Solid</span>
            </div>
            <div className="mt-1 text-lg font-bold text-emerald-700 sm:text-xl dark:text-emerald-300">
              {kpis.optimalSections}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Balanced & clash-free
            </div>
          </div>

          <div
            onClick={() => setStatusFilter(statusFilter === 'UNSCHEDULED' ? 'ALL' : 'UNSCHEDULED')}
            className={`cursor-pointer rounded-lg border p-2.5 transition-colors sm:p-3 ${statusFilter === 'UNSCHEDULED' ? 'border-slate-400 bg-slate-200/50 dark:bg-slate-800/50' : 'border-border bg-muted/20 hover:bg-muted/40'}`}
          >
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Unscheduled</span>
            </div>
            <div className="text-muted-foreground mt-1 text-lg font-bold sm:text-xl">
              {kpis.unscheduledSections}
            </div>
            <div className="text-muted-foreground text-[10px]">0 weekly slots</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="border-border border-t p-4 pt-4 sm:p-6">
        {/* Filter & Sort Controls */}
        <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
              <Filter className="h-3.5 w-3.5" />
              Filter:
            </span>

            {/* Program Filter */}
            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="border-input bg-background h-8 rounded-md border px-2.5 text-xs"
            >
              <option value="ALL">All Programs ({programs.length})</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.code ? `(${p.code})` : ''}
                </option>
              ))}
            </select>

            {/* Feasibility Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border-input bg-background h-8 rounded-md border px-2.5 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="CRITICAL">Critical / Clashing ({kpis.criticalSections})</option>
              <option value="ATTENTION">Needs Attention ({kpis.attentionSections})</option>
              <option value="FEASIBLE">Feasible ({kpis.optimalSections})</option>
              <option value="UNSCHEDULED">Unscheduled ({kpis.unscheduledSections})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border-input bg-background h-8 rounded-md border px-2.5 text-xs"
            >
              <option value="status">Feasibility & Risk (Default)</option>
              <option value="conflicts">Most Conflicts</option>
              <option value="utilization">Weekly Slot Count</option>
              <option value="name">Section Name</option>
            </select>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="bg-muted/30 border-border mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-[11px] font-medium">
              Daily Load Intensity:
            </span>
            <div className="flex items-center gap-1">
              <span className="bg-muted/30 text-muted-foreground inline-block h-3.5 w-6 rounded border text-center text-[9px] leading-3">
                0
              </span>
              <span className="text-muted-foreground text-[10px]">None</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3.5 w-6 rounded border bg-blue-100 text-center text-[9px] leading-3 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                1-2
              </span>
              <span className="text-muted-foreground text-[10px]">Light</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3.5 w-6 rounded border bg-emerald-100 text-center text-[9px] leading-3 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                3-4
              </span>
              <span className="text-muted-foreground text-[10px]">Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3.5 w-6 rounded border bg-teal-200 text-center text-[9px] leading-3 font-semibold text-teal-950 dark:bg-teal-900/50 dark:text-teal-200">
                5-6
              </span>
              <span className="text-muted-foreground text-[10px]">Optimal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3.5 w-6 rounded border bg-amber-200 text-center text-[9px] leading-3 font-semibold text-amber-950 dark:bg-amber-950/50 dark:text-amber-200">
                7
              </span>
              <span className="text-muted-foreground text-[10px]">Heavy</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3.5 w-6 rounded border bg-red-200 text-center text-[9px] leading-3 font-bold text-red-950 dark:bg-red-950/60 dark:text-red-200">
                8+
              </span>
              <span className="text-muted-foreground text-[10px]">Overload</span>
            </div>
          </div>

          <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <Info className="h-3 w-3" />
            <span>Click any row to jump into section schedule</span>
          </div>
        </div>

        {/* Matrix Table */}
        {displayedSections.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            No sections match the current filters.
          </div>
        ) : (
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-muted/40 border-border border-b">
                  <th className="text-muted-foreground w-64 p-3 font-semibold">
                    Section & Program
                  </th>
                  <th className="text-muted-foreground p-3 text-center font-semibold">
                    Feasibility
                  </th>
                  <th className="text-muted-foreground p-3 text-center font-semibold">
                    Weekly Slots
                  </th>
                  {DAYS.map((d) => (
                    <th
                      key={d}
                      className="text-muted-foreground w-16 p-3 text-center font-semibold"
                    >
                      {DAY_SHORT[d]}
                    </th>
                  ))}
                  <th className="text-muted-foreground p-3 text-center font-semibold">Coverage</th>
                  <th className="text-muted-foreground w-24 p-3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {displayedSections.map((item) => {
                  const isCritical = item.feasibilityStatus === 'CRITICAL';
                  const isAttention = item.feasibilityStatus === 'ATTENTION';
                  const isUnscheduled = item.feasibilityStatus === 'UNSCHEDULED';

                  return (
                    <tr
                      key={item.section.id}
                      onClick={() => onSelectSectionAndProgram(item.programId, item.section.id)}
                      className={`group hover:bg-muted/30 cursor-pointer transition-colors ${
                        isCritical
                          ? 'bg-red-50/20 dark:bg-red-950/10'
                          : isAttention
                            ? 'bg-amber-50/20 dark:bg-amber-950/10'
                            : ''
                      }`}
                    >
                      {/* Section Name & Program */}
                      <td className="p-3 align-middle">
                        <div className="flex flex-col">
                          <div className="text-foreground flex items-center gap-1.5 font-medium">
                            <span className="text-sm font-semibold">{item.section.name}</span>
                            {item.section.code && (
                              <span className="text-muted-foreground text-[10px]">
                                ({item.section.code})
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[11px]">
                            <GraduationCap className="h-3 w-3" />
                            <span className="max-w-[190px] truncate">{item.programName}</span>
                            {item.section.semester && (
                              <span>&bull; Sem {item.section.semester}</span>
                            )}
                          </div>
                          {item.flags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.flags.slice(0, 2).map((flag, idx) => (
                                <span
                                  key={idx}
                                  className={`rounded px-1.5 py-0.5 text-[9px] leading-none font-medium ${
                                    isCritical
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                                      : isAttention
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                                        : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {flag}
                                </span>
                              ))}
                              {item.flags.length > 2 && (
                                <span className="text-muted-foreground text-[9px]">
                                  +{item.flags.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Feasibility Status Badge & Score */}
                      <td className="p-3 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {isCritical && (
                            <Badge
                              variant="destructive"
                              className="gap-1 px-1.5 py-0.5 text-[10px]"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              {item.conflictCount > 0 ? `${item.conflictCount} Clash` : 'Critical'}
                            </Badge>
                          )}
                          {isAttention && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              <Clock className="h-2.5 w-2.5" />
                              Attention ({item.feasibilityScore}%)
                            </span>
                          )}
                          {(item.feasibilityStatus === 'FEASIBLE' ||
                            item.feasibilityStatus === 'EXCELLENT') && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              Feasible ({item.feasibilityScore}%)
                            </span>
                          )}
                          {isUnscheduled && (
                            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                              Empty
                            </span>
                          )}

                          {/* Mini Progress Bar */}
                          {!isUnscheduled && (
                            <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  item.feasibilityScore >= 80
                                    ? 'bg-emerald-500'
                                    : item.feasibilityScore >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${item.feasibilityScore}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Slots */}
                      <td className="p-3 text-center align-middle">
                        <div className="text-foreground font-semibold">{item.totalSlots}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {item.activeDaysCount} active days
                        </div>
                      </td>

                      {/* Day Load Cells (Heatmap columns) */}
                      {DAYS.map((d) => {
                        const count = item.dayDistribution[d] || 0;
                        return (
                          <td key={d} className="p-1.5 text-center align-middle">
                            <div
                              className={`mx-auto flex h-8 w-10 items-center justify-center rounded border text-xs transition-transform group-hover:scale-105 ${getSlotIntensityClass(
                                count,
                              )}`}
                              title={`${DAY_SHORT[d]}: ${count} slot${count !== 1 ? 's' : ''}`}
                            >
                              {count > 0 ? count : '-'}
                            </div>
                          </td>
                        );
                      })}

                      {/* Course Coverage */}
                      <td className="p-3 text-center align-middle">
                        <div className="text-foreground font-medium">
                          {item.assignedCoursesCount > 0 ? (
                            <span>
                              {item.scheduledCoursesCount}/{item.assignedCoursesCount}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        {item.assignedCoursesCount > 0 && (
                          <div className="text-muted-foreground text-[10px]">
                            {item.courseCoverageRate}% covered
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right align-middle">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:bg-primary/10 group-hover:text-primary h-8 gap-1 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSectionAndProgram(item.programId, item.section.id);
                          }}
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
