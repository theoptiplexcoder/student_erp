'use client';

import { useState, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Label,
  Input,
} from '@student-erp/ui';
import { ArrowLeft, Loader2, ArrowUp, ArrowDown, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useAdminProgram, useAdminPrograms, Program } from '@/hooks/api/admin/usePrograms';
import { useCreateCurriculum } from '@/hooks/api/admin/useCurriculums';

export default function CreateCurriculumPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { programId } = use(params);

  const { data: programData } = useAdminProgram(programId);
  const currentProgram = programData?.data || programData;

  const queryProgramIds = searchParams.get('programIds');
  const initialProgramIds = queryProgramIds
    ? queryProgramIds.split(',').filter(Boolean)
    : programId && programId !== 'all'
      ? [programId]
      : [];

  const { data: allProgramsData, isLoading: isLoadingPrograms } = useAdminPrograms(1, 100);
  const allPrograms: Program[] = allProgramsData?.data || [];

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0] || '');
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>(initialProgramIds);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const createCurriculum = useCreateCurriculum();

  // Move program up in sequential order
  const moveProgramUp = (index: number) => {
    if (index === 0) return;
    setSelectedProgramIds((prev) => {
      const next = [...prev];
      const prevItem = next[index - 1];
      const currentItem = next[index];
      if (prevItem && currentItem) {
        next[index - 1] = currentItem;
        next[index] = prevItem;
      }
      return next;
    });
  };

  // Move program down in sequential order
  const moveProgramDown = (index: number) => {
    if (index === selectedProgramIds.length - 1) return;
    setSelectedProgramIds((prev) => {
      const next = [...prev];
      const nextItem = next[index + 1];
      const currentItem = next[index];
      if (nextItem && currentItem) {
        next[index + 1] = currentItem;
        next[index] = nextItem;
      }
      return next;
    });
  };

  // Remove program from list
  const removeProgram = (id: string) => {
    setSelectedProgramIds((prev) => prev.filter((pId) => pId !== id));
  };

  // Add program to list
  const addProgram = (id: string) => {
    if (!selectedProgramIds.includes(id)) {
      setSelectedProgramIds((prev) => [...prev, id]);
    }
  };

  // Compute timeline and end date based on sequential durations
  const sequenceTimeline = useMemo(() => {
    if (!startDate) return [];

    let currentStart = new Date(startDate);
    if (isNaN(currentStart.getTime())) return [];

    return selectedProgramIds.map((id) => {
      const prog = allPrograms.find((p) => p.id === id);
      const duration = prog?.durationYears || 1;

      const progStart = new Date(currentStart);
      const progEnd = new Date(currentStart);
      progEnd.setFullYear(progEnd.getFullYear() + duration);

      currentStart = new Date(progEnd);

      return {
        programId: id,
        program: prog,
        durationYears: duration,
        startDateFormatted: progStart.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        endDateFormatted: progEnd.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      };
    });
  }, [startDate, selectedProgramIds, allPrograms]);

  const totalDurationYears = useMemo(() => {
    return selectedProgramIds.reduce((sum, id) => {
      const prog = allPrograms.find((p) => p.id === id);
      return sum + (prog?.durationYears || 1);
    }, 0);
  }, [selectedProgramIds, allPrograms]);

  const computedEndDateFormatted = useMemo(() => {
    if (!startDate || selectedProgramIds.length === 0) return null;
    const date = new Date(startDate);
    if (isNaN(date.getTime())) return null;
    date.setFullYear(date.getFullYear() + totalDurationYears);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [startDate, totalDurationYears, selectedProgramIds.length]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedProgramIds.length === 0) {
      setErrorMsg('Please select at least one program in the sequential curriculum.');
      return;
    }

    if (!startDate) {
      setErrorMsg('Please select a start date.');
      return;
    }

    const payload = {
      name,
      effectiveFrom: startDate,
      programIds: selectedProgramIds,
      programId: selectedProgramIds[0],
    };

    try {
      await createCurriculum.mutateAsync(payload);
      router.push('/admin/academics');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to create curriculum');
    }
  };

  const availableProgramsToAdd = allPrograms.filter((p) => !selectedProgramIds.includes(p.id));

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Link
          href={
            programId && programId !== 'all'
              ? `/admin/academics/programs/${programId}`
              : '/admin/academics'
          }
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>
            Academics /{' '}
            {programId && programId !== 'all' ? currentProgram?.name || 'Program' : 'Curriculums'} /
            New Curriculum
          </span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create Curriculum</h1>
        <p className="text-muted-foreground text-sm">
          Define the curriculum name, start date, and order of sequential programs.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Information</CardTitle>
            <CardDescription>
              Set up the curriculum details and arrange programs in chronological order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMsg && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="curriculum-name" className="text-sm font-medium">
                  Curriculum Name
                </Label>
                <Input
                  id="curriculum-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Integrated Tech Track 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Calculated End Date and Total Duration Banner */}
            {computedEndDateFormatted && (
              <div className="bg-muted/50 flex flex-col justify-between gap-3 rounded-lg border p-4 text-sm sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Calculated End Date:</span>
                  <span className="font-semibold">{computedEndDateFormatted}</span>
                </div>
                <div className="text-muted-foreground">
                  Total Duration:{' '}
                  <span className="text-foreground font-medium">
                    {totalDurationYears} {totalDurationYears === 1 ? 'Year' : 'Years'}
                  </span>{' '}
                  ({selectedProgramIds.length}{' '}
                  {selectedProgramIds.length === 1 ? 'program' : 'programs'})
                </div>
              </div>
            )}

            {/* Sequential Programs Section */}
            <div className="space-y-3">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <Label className="text-sm font-medium">Sequential Programs</Label>
                  <p className="text-muted-foreground text-xs">
                    Arrange the programs in the exact order students will take them.
                  </p>
                </div>

                {availableProgramsToAdd.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      id="select-program-to-add"
                      className="border-input bg-background h-9 rounded-md border px-3 text-xs focus:outline-none"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          addProgram(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="" disabled>
                        + Add a program to sequence...
                      </option>
                      {availableProgramsToAdd.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code}) — {p.durationYears}{' '}
                          {p.durationYears === 1 ? 'yr' : 'yrs'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {isLoadingPrograms ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  Loading programs...
                </div>
              ) : selectedProgramIds.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                  No programs added to the sequence yet. Add at least one program above.
                </div>
              ) : (
                <div className="space-y-2">
                  {sequenceTimeline.map((item, index) => (
                    <div
                      key={item.programId}
                      className="bg-card hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center"
                    >
                      <div className="flex items-start gap-3 sm:items-center">
                        <div className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">
                              {item.program?.name || 'Program'}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              ({item.program?.code || ''})
                            </span>
                            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                              {item.durationYears} {item.durationYears === 1 ? 'Year' : 'Years'}
                            </span>
                          </div>
                          <div className="text-muted-foreground mt-0.5 text-xs">
                            Estimated: {item.startDateFormatted} – {item.endDateFormatted}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveProgramUp(index)}
                          disabled={index === 0}
                          title="Move earlier"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveProgramDown(index)}
                          disabled={index === selectedProgramIds.length - 1}
                          title="Move later"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-8 w-8"
                          onClick={() => removeProgram(item.programId)}
                          title="Remove program"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Link
              href={
                programId && programId !== 'all'
                  ? `/admin/academics/programs/${programId}`
                  : '/admin/academics'
              }
              className="w-full sm:w-auto"
            >
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createCurriculum.isPending || selectedProgramIds.length === 0}
              className="w-full sm:w-auto"
            >
              {createCurriculum.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Curriculum
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
