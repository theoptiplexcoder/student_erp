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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
} from '@student-erp/ui';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Layers,
  CalendarCheck2,
} from 'lucide-react';
import {
  useSessionPlanningSummary,
  useGenerateSessionOccurrences,
  SessionPlanningSummaryItem,
} from '@/hooks/api/admin/useSessionPlanning';
import { SessionCourseDetail } from './SessionCourseDetail';

interface SessionPlanningCardProps {
  sectionId: string;
  sectionName: string;
  sectionCode?: string;
  termId?: string;
  terms?: Array<{
    id: string;
    name: string;
    startDate?: string | Date;
    endDate?: string | Date;
  }>;
  onTermChange?: (termId: string) => void;
}

export function SessionPlanningCard({
  sectionId,
  sectionName,
  sectionCode,
  termId,
  terms = [],
  onTermChange,
}: SessionPlanningCardProps) {
  const activeTermId = termId || (terms.length > 0 ? terms[0].id : '');
  const activeTerm = terms.find((t) => t.id === activeTermId);

  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);

  const {
    data: planningData = [],
    isLoading,
    isRefetching,
    refetch,
  } = useSessionPlanningSummary(activeTermId, sectionId, {
    enabled: Boolean(activeTermId && sectionId),
  });

  const generateMutation = useGenerateSessionOccurrences();

  const handleGenerate = async () => {
    if (!activeTermId) {
      alert('Please select an academic term first.');
      return;
    }

    try {
      const res = await generateMutation.mutateAsync({
        termId: activeTermId,
        sectionIds: [sectionId],
      });
      alert(res.message || 'Session occurrences generated successfully!');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to generate session occurrences');
    }
  };

  // High-level aggregates across all courses
  const aggregates = useMemo(() => {
    return planningData.reduce(
      (acc, item) => ({
        coursesCount: acc.coursesCount + 1,
        totalPlanned: acc.totalPlanned + item.planned,
        totalCompleted: acc.totalCompleted + item.completed,
        totalCancelled: acc.totalCancelled + item.cancelled,
        totalRemaining: acc.totalRemaining + item.remaining,
        totalPlannedHours: acc.totalPlannedHours + item.plannedHours,
        totalCompletedHours: acc.totalCompletedHours + item.completedHours,
        hasGenerated: acc.hasGenerated || item.occurrencesGenerated,
      }),
      {
        coursesCount: 0,
        totalPlanned: 0,
        totalCompleted: 0,
        totalCancelled: 0,
        totalRemaining: 0,
        totalPlannedHours: 0,
        totalCompletedHours: 0,
        hasGenerated: false,
      },
    );
  }, [planningData]);

  const formatDateRange = (start?: string | Date, end?: string | Date) => {
    if (!start || !end) return '';
    const s = new Date(start).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const e = new Date(end).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return `${s} – ${e}`;
  };

  return (
    <div className="space-y-4">
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b p-4 pb-3 sm:p-6 sm:pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl font-bold tracking-tight sm:text-2xl">
                  Session Planning & Instructional Hours
                </CardTitle>
                {aggregates.hasGenerated ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-50/50 text-xs text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                  >
                    <CalendarCheck2 className="mr-1 h-3 w-3" />
                    Occurrences Synced
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-500/40 bg-amber-50/50 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Projected from Schedule
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                Calculates total planned, completed, and remaining instructional classes between the
                program term dates, deducting academic calendar holidays.
              </CardDescription>
            </div>

            {/* Controls: Term Selector & Generate Button */}
            <div className="flex flex-wrap items-center gap-2">
              {terms.length > 0 && onTermChange && (
                <div className="flex items-center gap-1.5">
                  <select
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 rounded-md border px-3 py-1 text-xs shadow-sm focus-visible:ring-1 focus-visible:outline-none sm:text-sm"
                    value={activeTermId}
                    onChange={(e) => onTermChange(e.target.value)}
                  >
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !activeTermId}
                className="h-9 text-xs sm:text-sm"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    {aggregates.hasGenerated ? 'Re-sync Occurrences' : 'Generate Planned Sessions'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Date range contextual helper */}
          {activeTerm?.startDate && activeTerm?.endDate && (
            <div className="text-muted-foreground flex items-center gap-1 pt-2 text-xs">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Term Horizon: {formatDateRange(activeTerm.startDate, activeTerm.endDate)}</span>
            </div>
          )}
        </CardHeader>

        {/* Aggregated KPI strip */}
        <div className="bg-muted/20 grid grid-cols-2 divide-x divide-y border-b text-xs sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6">
          <div className="p-3 text-center sm:p-4">
            <p className="text-muted-foreground font-medium">Courses</p>
            <p className="mt-0.5 text-lg font-bold sm:text-xl">{aggregates.coursesCount}</p>
          </div>
          <div className="p-3 text-center sm:p-4">
            <p className="text-muted-foreground font-medium">Planned</p>
            <p className="mt-0.5 text-lg font-bold text-blue-600 sm:text-xl dark:text-blue-400">
              {aggregates.totalPlanned}
            </p>
          </div>
          <div className="p-3 text-center sm:p-4">
            <p className="text-muted-foreground font-medium">Completed</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-600 sm:text-xl dark:text-emerald-400">
              {aggregates.totalCompleted}
            </p>
          </div>
          <div className="p-3 text-center sm:p-4">
            <p className="text-muted-foreground font-medium">Cancelled</p>
            <p className="text-destructive mt-0.5 text-lg font-bold sm:text-xl">
              {aggregates.totalCancelled}
            </p>
          </div>
          <div className="p-3 text-center sm:p-4">
            <p className="text-muted-foreground font-medium">Remaining</p>
            <p className="text-foreground mt-0.5 text-lg font-bold sm:text-xl">
              {aggregates.totalRemaining}
            </p>
          </div>
          <div className="p-3 text-center sm:p-4">
            <p className="text-muted-foreground font-medium">Planned Hours</p>
            <p className="text-foreground mt-0.5 text-lg font-bold sm:text-xl">
              {Math.round(aggregates.totalPlannedHours)}h
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : planningData.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-foreground text-sm font-medium">No timetable entries found</p>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
                Ensure weekly timetable entries are defined in the timetable schedule below for this
                section.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead className="text-foreground font-semibold">Course</TableHead>
                    <TableHead className="text-foreground text-center font-semibold">
                      Weekly Sessions
                    </TableHead>
                    <TableHead className="text-foreground text-center font-semibold">
                      Planned
                    </TableHead>
                    <TableHead className="text-foreground text-center font-semibold">
                      Completed
                    </TableHead>
                    <TableHead className="text-foreground text-center font-semibold">
                      Cancelled
                    </TableHead>
                    <TableHead className="text-foreground text-center font-semibold">
                      Remaining
                    </TableHead>
                    <TableHead className="text-foreground text-right font-semibold">
                      Hours
                    </TableHead>
                    <TableHead className="text-foreground w-28 text-center font-semibold">
                      Schedule
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planningData.map((row) => {
                    const isSelected = selectedCourse?.id === row.courseId;
                    return (
                      <TableRow
                        key={row.courseId}
                        className={`cursor-pointer text-xs transition-colors ${
                          isSelected ? 'bg-primary/5 font-medium' : 'hover:bg-muted/30'
                        }`}
                        onClick={() =>
                          setSelectedCourse(
                            isSelected
                              ? null
                              : { id: row.courseId, name: row.courseName, code: row.courseCode },
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground font-semibold">{row.courseName}</span>
                            <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                              <span className="font-mono">{row.courseCode}</span>
                              {row.creditValue != null && <span>• {row.creditValue} credits</span>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {row.weeklySessions}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-blue-600 dark:text-blue-400">
                          {row.planned}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-emerald-600 dark:text-emerald-400">
                          {row.completed}
                        </TableCell>
                        <TableCell className="text-destructive text-center font-medium">
                          {row.cancelled}
                        </TableCell>
                        <TableCell className="text-foreground text-center font-medium">
                          {row.remaining}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {row.plannedHours}h
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={isSelected ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourse(
                                isSelected
                                  ? null
                                  : {
                                      id: row.courseId,
                                      name: row.courseName,
                                      code: row.courseCode,
                                    },
                              );
                            }}
                          >
                            {isSelected ? (
                              <>
                                Hide <ChevronDown className="ml-1 h-3 w-3" />
                              </>
                            ) : (
                              <>
                                View <ChevronRight className="ml-1 h-3 w-3" />
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Course Drilldown View */}
      {selectedCourse && activeTermId && (
        <SessionCourseDetail
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
          courseCode={selectedCourse.code}
          sectionId={sectionId}
          sectionName={sectionName}
          termId={activeTermId}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
