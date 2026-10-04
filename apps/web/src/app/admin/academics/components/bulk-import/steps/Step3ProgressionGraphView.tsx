'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Input,
  Label,
} from '@student-erp/ui';
import {
  ArrowRight,
  BookOpen,
  Users,
  AlertTriangle,
  GitBranch,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Check,
} from 'lucide-react';
import { ParsedAcademicData } from '../utils/csv-parser';
import { useAcademicYears, useCreateAcademicYear } from '@/hooks/api/admin/useAcademicYears';

interface Step3ProgressionGraphViewProps {
  data: ParsedAcademicData;
  onExecute: (academicYearCode: string) => void;
  onBack: () => void;
  isExecuting: boolean;
}

export function Step3ProgressionGraphView({
  data,
  onExecute,
  onBack,
  isExecuting,
}: Step3ProgressionGraphViewProps) {
  const { data: existingYears = [], isLoading: isLoadingYears } = useAcademicYears();
  const createAcademicYearMutation = useCreateAcademicYear();

  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedYearName, setSelectedYearName] = useState<string>('');

  // Form state for creating a new academic year
  const [newYearName, setNewYearName] = useState<string>(data.academicYearCode || 'AY-2026-27');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2027-05-31');
  const [createError, setCreateError] = useState<string | null>(null);

  // Sync initial selection once existingYears load
  useEffect(() => {
    if (existingYears.length > 0 && !selectedYearName) {
      // If data has an academicYearCode matching an existing year, select it
      const match = data.academicYearCode
        ? existingYears.find((y) => y.name === data.academicYearCode)
        : null;
      if (match) {
        setSelectedYearName(match.name);
        setMode('select');
      } else {
        const activeYear = existingYears.find((y) => y.isCurrent || y.status === 'ACTIVE');
        setSelectedYearName(activeYear ? activeYear.name : existingYears[0].name);
        setMode('select');
      }
    } else if (existingYears.length === 0 && !isLoadingYears) {
      setMode('create');
    }
  }, [existingYears, isLoadingYears, data.academicYearCode, selectedYearName]);

  const handleCreateYear = async () => {
    if (!newYearName.trim()) {
      setCreateError('Academic Year code/name is required');
      return;
    }
    setCreateError(null);
    try {
      const created = await createAcademicYearMutation.mutateAsync({
        name: newYearName.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive: true,
      });
      setSelectedYearName(created.name);
      setMode('select');
    } catch (err: any) {
      setCreateError(
        err?.response?.data?.message || err.message || 'Failed to create academic year',
      );
    }
  };

  const currentAcademicYear = mode === 'select' ? selectedYearName : newYearName.trim();

  const handleConfirmAndIngest = async () => {
    if (mode === 'create') {
      // First ensure the year is created
      if (!newYearName.trim()) {
        setCreateError('Academic year name is required');
        return;
      }
      try {
        const created = await createAcademicYearMutation.mutateAsync({
          name: newYearName.trim(),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          isActive: true,
        });
        onExecute(created.name);
      } catch (err: any) {
        setCreateError(
          err?.response?.data?.message || err.message || 'Failed to create academic year',
        );
      }
    } else {
      onExecute(selectedYearName);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">3. Curriculum Progression & Section Lineage</h3>
          <p className="text-muted-foreground text-sm">
            Review the directional progression graph. Sections are linked directly to terms for
            seamless cohort promotion.
          </p>
        </div>
      </div>

      {/* Target Academic Year Configuration */}
      <div className="bg-card rounded-lg border p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary h-5 w-5" />
            <h4 className="text-sm font-semibold">Target Academic Session</h4>
          </div>
          <div className="bg-muted flex items-center gap-1 rounded-md p-1 text-xs">
            <button
              type="button"
              disabled={existingYears.length === 0}
              onClick={() => setMode('select')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                mode === 'select'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              } ${existingYears.length === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              Choose Existing ({existingYears.length})
            </button>
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              + Create New Year
            </button>
          </div>
        </div>

        <div className="pt-3">
          {mode === 'select' ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-72">
                <select
                  id="existingYearSelect"
                  value={selectedYearName}
                  onChange={(e) => setSelectedYearName(e.target.value)}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
                >
                  {existingYears.map((ay) => (
                    <option key={ay.id} value={ay.name}>
                      {ay.name} {ay.isCurrent || ay.status === 'ACTIVE' ? '★ (Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-muted-foreground text-xs">
                Imported sections will be linked to academic year{' '}
                <strong className="text-foreground">{selectedYearName}</strong>.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="newYearName" className="text-xs">
                    Academic Year Name/Code *
                  </Label>
                  <Input
                    id="newYearName"
                    placeholder="e.g. AY-2026-27"
                    value={newYearName}
                    onChange={(e) => setNewYearName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate" className="text-xs">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              {createError && (
                <div className="rounded bg-red-50 p-2 text-xs font-medium text-red-700">
                  {createError}
                </div>
              )}
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  This academic year will be created under your institution and linked to all
                  imported sections.
                </span>
                {existingYears.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setMode('select')}
                  >
                    Cancel, pick existing
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progression Graphs per Program */}
      <div className="space-y-6">
        {data.curriculums.map((curr, cIdx) => {
          const prog = data.programs.find((p) => p.code === curr.programCode);
          return (
            <Card key={cIdx} className="border-border shadow-xs">
              <CardHeader className="bg-muted/10 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GitBranch className="text-primary h-5 w-5" />
                      <span>{prog ? prog.name : curr.programCode}</span>
                      <Badge variant="outline" className="font-mono">
                        {curr.programCode}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Curriculum Scheme: <strong>{curr.curriculumName}</strong>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {curr.terms.length} Terms Directed Graph
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Horizontal Progression Chain */}
                <div className="flex flex-col gap-4 overflow-x-auto pb-2">
                  <div className="flex min-w-max items-start gap-3">
                    {curr.terms.map((term, tIdx) => {
                      const totalCapacity = term.sections.reduce((acc, s) => acc + s.capacity, 0);
                      const nextTerm = curr.terms[tIdx + 1];
                      const nextCapacity = nextTerm
                        ? nextTerm.sections.reduce((acc, s) => acc + s.capacity, 0)
                        : null;
                      const hasCapacityMismatch =
                        nextCapacity !== null &&
                        term.sections.length > 0 &&
                        nextTerm.sections.length > 0 &&
                        totalCapacity > nextCapacity;

                      return (
                        <div key={term.sequence} className="flex items-center gap-3">
                          {/* Term Card */}
                          <div className="bg-card w-64 rounded-lg border p-3 shadow-xs">
                            <div className="flex items-center justify-between border-b pb-2">
                              <span className="text-primary text-xs font-semibold">
                                {term.name || `Term ${term.sequence}`}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                Seq {term.sequence}
                              </Badge>
                            </div>

                            {/* Courses List */}
                            <div className="mt-2 space-y-1">
                              <div className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
                                <BookOpen className="h-3 w-3" /> Courses ({term.courses.length})
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {term.courses.map((tc) => (
                                  <span
                                    key={tc.courseCode}
                                    title={
                                      tc.prerequisites?.length
                                        ? `Requires: ${tc.prerequisites.join(', ')}`
                                        : undefined
                                    }
                                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                                      tc.prerequisites?.length
                                        ? 'border-amber-200 bg-amber-50 text-amber-900'
                                        : 'bg-muted text-muted-foreground border-border'
                                    }`}
                                  >
                                    {tc.courseCode}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Pre-linked Sections for Cohort Promotion */}
                            <div className="mt-3 space-y-1 border-t pt-2">
                              <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" /> Sections ({term.sections.length})
                                </span>
                                <span className="text-[10px]">Cap: {totalCapacity}</span>
                              </div>
                              {term.sections.length === 0 ? (
                                <span className="text-muted-foreground text-[10px] italic">
                                  No sections defined
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {term.sections.map((s) => (
                                    <span
                                      key={s.code}
                                      className="bg-primary/10 text-primary border-primary/20 rounded border px-1.5 py-0.5 font-mono text-[10px]"
                                    >
                                      Sec {s.code} ({s.capacity})
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Capacity Bottleneck Warning */}
                            {hasCapacityMismatch && (
                              <div className="mt-2 flex items-center gap-1 rounded bg-amber-50 p-1 text-[10px] text-amber-800">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                                <span>
                                  Seats shrink from {totalCapacity} → {nextCapacity}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Progression Flow Arrow */}
                          {tIdx < curr.terms.length - 1 && (
                            <div className="text-muted-foreground flex flex-col items-center justify-center">
                              <ArrowRight className="h-5 w-5" />
                              <span className="text-[9px] font-semibold tracking-wider uppercase">
                                Promotes
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirmation & Stats Bar */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={onBack} disabled={isExecuting}>
          ← Back to Code Resolver
        </Button>
        <Button
          onClick={handleConfirmAndIngest}
          disabled={
            isExecuting ||
            createAcademicYearMutation.isPending ||
            (mode === 'select' ? !selectedYearName : !newYearName.trim())
          }
          className="bg-primary text-primary-foreground shadow-sm"
        >
          {isExecuting || createAcademicYearMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {createAcademicYearMutation.isPending
                ? 'Creating Academic Year...'
                : 'Ingesting Academic Structure...'}
            </span>
          ) : (
            'Confirm & Ingest Structure (3NF) →'
          )}
        </Button>
      </div>
    </div>
  );
}
