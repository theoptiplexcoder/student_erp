'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { TimetableGrid } from '@/components/admin/timetable/timetable-grid';
import { TimetableToolbar } from '@/components/admin/timetable/timetable-toolbar';
import { TimetableBulkActions } from '@/components/admin/timetable/timetable-bulk-actions';
import { TimetableEntryForm } from '@/components/admin/timetable/timetable-entry-form';
import { TimetableMergeModal } from '@/components/admin/timetable/timetable-merge-modal';
import {
  TimetableGenerationModal,
  TimetableGenerationConfig,
} from '@/components/admin/timetable/timetable-generation-modal';
import { TimetableOverwriteWarningDialog } from '@/components/admin/timetable/timetable-overwrite-warning-dialog';
import {
  TimetableGenerationProgressBanner,
  GenerationResultSummary,
} from '@/components/admin/timetable/timetable-generation-progress';
import { TimetableContextConflictPanel } from '@/components/admin/timetable/timetable-context-conflict-panel';
import { TimetablePublishModal } from '@/components/admin/timetable/timetable-publish-modal';
import { TimetableProgramSectionsSummary } from '@/components/admin/timetable/timetable-program-sections-summary';
import { TimetableOverviewHeatmap } from '@/components/admin/timetable/timetable-overview-heatmap';
import {
  findTimetableConflicts,
  TimetableConflict,
} from '@/components/admin/timetable/timetable-conflict-utils';
import {
  useAdminTimetableConflicts,
  useGenerateTimetable,
  useAdminTimetable,
  usePublishTimetable,
  useExportTimetable,
  useImportTimetable,
  useSwapTimetableSlots,
  useCreateTimetableEntry,
  useUpdateTimetableEntry,
  useDeleteTimetableEntry,
  useMoveTimetableEntry,
} from '@student-erp/hooks';
import { TimetableConflictBadge } from '@/components/admin/timetable/timetable-conflict-badge';
import { useAdminAllCurriculums } from '@/hooks/api/admin/useCurriculums';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';
import { useAcademicYears } from '@/hooks/api/admin/useAcademicYears';
import { TimetableImportModal } from '@/components/admin/timetable/timetable-import-modal';
import { SessionPlanningCard } from '@/components/admin/sections/SessionPlanningCard';
import { AlertTriangle, ChevronDown, ChevronUp, Save, Undo2, CheckCircle2 } from 'lucide-react';
import { Button, Badge } from '@student-erp/ui';

interface UnsavedMove {
  entryId: string;
  previous: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  target: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
}

export default function AdminTimetablePage() {
  const [curriculumId, setCurriculumId] = useState('');
  const [programId, setProgramId] = useState('');
  const [termId, setTermId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [generationModalOpen, setGenerationModalOpen] = useState(false);
  const [overwriteWarningOpen, setOverwriteWarningOpen] = useState(false);
  const [pendingGenerationConfig, setPendingGenerationConfig] =
    useState<TimetableGenerationConfig | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [generationConflicts, setGenerationConflicts] = useState<any[]>([]);
  const [generationSummary, setGenerationSummary] = useState<GenerationResultSummary | null>(null);

  // Selected entry for live Context / Conflict Inspector side-panel
  const [inspectorEntry, setInspectorEntry] = useState<any | null>(null);

  // Unsaved changes tracking for manual adjustments
  const [unsavedMoves, setUnsavedMoves] = useState<UnsavedMove[]>([]);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  // Metadata queries
  const { data: curriculumsData } = useAdminAllCurriculums();
  const { data: programsResponse } = useAdminPrograms(1, 100);
  const { data: terms } = useAdminTerms(curriculumId);
  const { data: academicYears } = useAcademicYears();
  const { data: allSectionsResponse, isLoading: isAllSectionsLoading } = useAdminSections(
    1,
    200,
    '',
  );
  const { data: programSectionsResponse, isLoading: isProgramSectionsLoading } = useAdminSections(
    1,
    100,
    '',
    {
      programId: programId || undefined,
    },
  );

  const curriculums = curriculumsData || [];
  const rawPrograms = programsResponse?.data || [];

  const programs = useMemo(() => {
    if (!curriculumId) return rawPrograms;
    const selectedCurr = curriculums.find((c: any) => c.id === curriculumId);
    if (selectedCurr?.programs && selectedCurr.programs.length > 0) {
      return selectedCurr.programs;
    }
    return rawPrograms;
  }, [curriculumId, curriculums, rawPrograms]);

  const selectedProgram = programs.find((p: any) => p.id === programId);
  const allSections = allSectionsResponse?.data || [];

  const curriculumSections = useMemo(() => {
    if (!curriculumId) return allSections;
    const allowedProgIds = new Set(programs.map((p: any) => p.id));
    return allSections.filter(
      (s: any) =>
        (s.programId && allowedProgIds.has(s.programId)) ||
        (s.program?.id && allowedProgIds.has(s.program.id)),
    );
  }, [curriculumId, programs, allSections]);

  const sections = programId
    ? programSectionsResponse?.data || []
    : curriculumId
      ? curriculumSections
      : allSections;
  const isSectionsLoading = programId ? isProgramSectionsLoading : isAllSectionsLoading;

  // Auto-select active/first term when terms load if none selected
  useEffect(() => {
    if (!termId && terms && terms.length > 0) {
      setTermId(terms[0].id);
    }
  }, [terms, termId]);

  const selectedTerm = terms?.find((t: any) => t.id === termId);
  const selectedAcademicYear = academicYears?.find(
    (ay: any) => ay.id === selectedTerm?.academicYearId,
  );

  // Timetable data & conflict queries
  const { data: serverConflicts } = useAdminTimetableConflicts(termId);
  const { data: timetableData, isPending: isTimetablePending } = useAdminTimetable({
    termId,
    sectionId: sectionId || undefined,
    dayOfWeek: dayOfWeek || undefined,
  });

  const { mutate: generateTimetable, isPending: isGenerating } = useGenerateTimetable();
  const { mutate: publishTimetable, isPending: isPublishing } = usePublishTimetable();
  const { mutate: exportTimetable } = useExportTimetable();
  const { mutate: importTimetable } = useImportTimetable();
  const { mutate: swapSlots } = useSwapTimetableSlots();
  const { mutateAsync: moveEntry } = useMoveTimetableEntry();

  const { mutateAsync: createEntry, isPending: isCreating } = useCreateTimetableEntry();
  const { mutateAsync: updateEntry, isPending: isUpdating } = useUpdateTimetableEntry();
  const { mutateAsync: deleteEntry, isPending: isDeleting } = useDeleteTimetableEntry();

  const rawEntries = Array.isArray(timetableData)
    ? timetableData
    : (timetableData as any)?.data || [];

  // Active entries filtered by program/section + applied optimistic unsaved moves
  const entries = useMemo(() => {
    const arr = Array.isArray(rawEntries) ? rawEntries : [];

    let filtered = arr;
    if (sectionId) {
      filtered = arr.filter((e: any) => e.sectionId === sectionId || e.section?.id === sectionId);
    } else if (programId || curriculumId) {
      if (sections.length > 0) {
        const activeSecIds = new Set(sections.map((s: any) => s.id));
        filtered = arr.filter(
          (e: any) =>
            activeSecIds.has(e.sectionId) || (e.section && activeSecIds.has(e.section.id)),
        );
      }
    }

    // Apply unsaved moves optimistically to visual grid
    if (unsavedMoves.length > 0) {
      const moveMap = new Map(unsavedMoves.map((m) => [m.entryId, m.target]));
      return filtered.map((e: any) => {
        const mv = moveMap.get(e.id);
        if (mv) {
          return {
            ...e,
            dayOfWeek: mv.dayOfWeek,
            startTime: mv.startTime,
            endTime: mv.endTime,
          };
        }
        return e;
      });
    }

    return filtered;
  }, [rawEntries, programId, curriculumId, sections, sectionId, unsavedMoves]);

  // Keep inspectorEntry synced with updated entries
  useEffect(() => {
    if (inspectorEntry) {
      const updated = entries.find((e: any) => e.id === inspectorEntry.id);
      if (updated) {
        setInspectorEntry(updated);
      }
    }
  }, [entries, inspectorEntry]);

  // Warn before browser navigation if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedMoves.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedMoves]);

  const timetableStatus =
    entries.length === 0 ? 'NO_TIMETABLE' : (rawEntries[0]?.timetable?.status as any) || 'DRAFT';

  // Live client-side conflicts calculated across active entries
  const clientConflicts = useMemo<TimetableConflict[]>(() => {
    return findTimetableConflicts(entries);
  }, [entries]);

  // Combined conflict list
  const combinedConflicts = useMemo(() => {
    const list: any[] = [...generationConflicts];
    const seenMessages = new Set(list.map((c) => c.message));

    for (const c of clientConflicts) {
      if (!seenMessages.has(c.message)) {
        seenMessages.add(c.message);
        list.push(c);
      }
    }

    if (Array.isArray(serverConflicts)) {
      for (const sc of serverConflicts) {
        if (!seenMessages.has(sc.message)) {
          seenMessages.add(sc.message);
          list.push(sc);
        }
      }
    }

    return list;
  }, [generationConflicts, clientConflicts, serverConflicts]);

  // Derive courses from sections and timetable entries
  const courses = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{
      id: string;
      name: string;
      code: string;
      credits: number;
      isPractical: boolean;
    }> = [];

    for (const sec of sections) {
      for (const ca of sec.courseAssignments || []) {
        if (ca.course && !seen.has(ca.course.id)) {
          seen.add(ca.course.id);
          result.push({
            id: ca.course.id,
            name: ca.course.name || '',
            code: ca.course.code || '',
            credits: ca.course.creditValue || 0,
            isPractical: false,
          });
        }
      }
    }

    for (const entry of entries) {
      const course = entry.course || entry.courseOffering?.course;
      if (course && !seen.has(course.id)) {
        seen.add(course.id);
        result.push({
          id: course.id,
          name: course.name || '',
          code: course.code || '',
          credits: course.credits || 0,
          isPractical: course.isPractical || false,
        });
      }
    }
    return result;
  }, [sections, entries]);

  // Execute timetable generation
  const executeGeneration = (config: TimetableGenerationConfig) => {
    generateTimetable(
      {
        termId: config.termId,
        sectionIds: config.sectionIds,
        days: config.days,
        workingHours: config.workingHours,
        breakPeriods: config.breakPeriods,
        defaultSessionDuration: config.defaultSessionDuration,
        ...(config.selectedRoomIds && config.selectedRoomIds.length > 0
          ? { selectedRoomIds: config.selectedRoomIds }
          : {}),
        ...(config.sessionDurations && Object.keys(config.sessionDurations).length > 0
          ? { sessionDurations: config.sessionDurations }
          : {}),
      },
      {
        onSuccess: (response: any) => {
          const newConflicts = response?.conflicts || [];
          const newSummary = response?.summary || null;
          setGenerationConflicts(newConflicts);

          const totalSessions =
            newSummary?.totalSessions ??
            newSummary?.total ??
            response?.timetable?.entries?.length ??
            0;

          // Count how many sections have conflicts
          const conflictSectionIds = new Set<string>();
          for (const c of newConflicts) {
            if (c.sectionId) conflictSectionIds.add(c.sectionId);
          }

          // Determine target section and program to auto-focus onto
          const targetSectionId = config.sectionIds[0];
          const matchedSection = allSections.find((s: any) => s.id === targetSectionId);
          const targetProgId =
            (matchedSection as any)?.programId ||
            (matchedSection as any)?.program?.id ||
            programId ||
            '';

          setGenerationSummary({
            sectionsProcessed: newSummary?.sectionsProcessed || config.sectionIds.length,
            sessionsGenerated: totalSessions,
            conflictsFound: newConflicts.length,
            sectionsRequiringAdjustment: conflictSectionIds.size,
            firstGeneratedSectionId: targetSectionId,
            firstGeneratedProgramId: targetProgId,
          });

          // Always focus on the first generated section/program. Keeping an older section
          // filter here makes a successful generation look empty when generation was run for
          // another section (or for all sections).
          if (targetProgId) {
            setProgramId(targetProgId);
          }
          if (targetSectionId) {
            setSectionId(targetSectionId);
          }

          // Clear unsaved moves on fresh generation
          setUnsavedMoves([]);
        },
        onError: (err: any) => {
          const backendMsg = err.response?.data?.message;
          const msg = Array.isArray(backendMsg)
            ? backendMsg.join(', ')
            : backendMsg || err.message || 'Unknown error';
          alert('Failed to generate timetable: ' + msg);
        },
      },
    );
  };

  // Pre-flight check: trigger overwrite warning dialog if existing timetable entries exist
  const handleRequestGeneration = (config: TimetableGenerationConfig) => {
    const existingInScope = rawEntries.filter((e: any) => config.sectionIds.includes(e.sectionId));

    if (existingInScope.length > 0) {
      setPendingGenerationConfig(config);
      setOverwriteWarningOpen(true);
    } else {
      executeGeneration(config);
    }
  };

  // Drag and drop handler
  const handleMoveEntry = (
    entryId: string,
    targetDay: string,
    targetStartTime: string,
    targetEndTime: string,
  ) => {
    const existingEntry = entries.find((e: any) => e.id === entryId);
    if (!existingEntry) return;

    // Check if slot actually changed
    const currentStart = String(existingEntry.startTime).includes('T')
      ? String(existingEntry.startTime).substring(11, 16)
      : String(existingEntry.startTime);

    if (existingEntry.dayOfWeek === targetDay && currentStart === targetStartTime) {
      return;
    }

    // Add to unsaved moves queue
    setUnsavedMoves((prev) => {
      const filtered = prev.filter((m) => m.entryId !== entryId);
      return [
        ...filtered,
        {
          entryId,
          previous: {
            dayOfWeek: existingEntry.dayOfWeek,
            startTime: currentStart,
            endTime: String(existingEntry.endTime).includes('T')
              ? String(existingEntry.endTime).substring(11, 16)
              : String(existingEntry.endTime),
          },
          target: {
            dayOfWeek: targetDay,
            startTime: targetStartTime,
            endTime: targetEndTime,
          },
        },
      ];
    });

    // Update inspector
    setInspectorEntry({
      ...existingEntry,
      dayOfWeek: targetDay,
      startTime: targetStartTime,
      endTime: targetEndTime,
    });
  };

  // Save changes batch
  const handleSaveChanges = async () => {
    if (unsavedMoves.length === 0) return;
    setIsSavingChanges(true);

    try {
      for (const mv of unsavedMoves) {
        await moveEntry({
          id: mv.entryId,
          data: {
            dayOfWeek: mv.target.dayOfWeek as any,
            startTime: mv.target.startTime,
            endTime: mv.target.endTime,
          },
        });
      }
      setUnsavedMoves([]);
      alert('Timetable adjustments saved successfully.');
    } catch (err: any) {
      alert('Failed to save timetable changes: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleDiscardChanges = () => {
    if (window.confirm('Discard all unsaved session moves?')) {
      setUnsavedMoves([]);
    }
  };

  // Publish workflow handler
  const handleConfirmPublish = () => {
    if (!termId) return;
    publishTimetable(termId, {
      onSuccess: () => {
        setPublishModalOpen(false);
        alert(
          `Timetable published successfully for ${
            sections.length || allSections.length
          } sections. Now live for faculty and students.`,
        );
      },
      onError: (err: any) => alert('Failed to publish timetable: ' + err.message),
    });
  };

  const handleExport = () => {
    if (!termId) return;
    exportTimetable(
      { termId, format: 'csv' },
      {
        onSuccess: (data: any) => {
          const blob = new Blob([data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `timetable-${termId}.csv`;
          a.click();
        },
        onError: (err: any) => alert('Failed to export timetable: ' + err.message),
      },
    );
  };

  const handleImport = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (termId) formData.append('termId', termId);

    importTimetable(formData, {
      onSuccess: () => alert('Timetable imported successfully'),
      onError: (err: any) => alert('Failed to import timetable: ' + err.message),
    });
  };

  const handleSwap = (entryIdA: string, entryIdB: string) => {
    swapSlots(
      { entryIdA, entryIdB },
      {
        onSuccess: () => alert('Time slots swapped successfully'),
        onError: (err: any) => alert('Failed to swap time slots: ' + err.message),
      },
    );
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleEntryClick = (entry: any) => {
    setInspectorEntry(entry);
  };

  const handleEmptySlotClick = (day: string, startTime: string) => {
    const parts = startTime.split(':');
    const startHour = parseInt(parts[0], 10) || 9;
    const endHour = startHour + 1;
    const endStr = `${endHour.toString().padStart(2, '0')}:${parts[1] || '00'}`;

    setEditingEntry({
      dayOfWeek: day,
      startTime,
      endTime: endStr,
      sectionId: sectionId || (sections.length > 0 ? sections[0].id : ''),
    });
    setFormOpen(true);
  };

  const handleSaveEntry = async (entryData: any) => {
    if (!termId) {
      throw new Error('Please select a term first.');
    }

    if (entryData.id) {
      await updateEntry({
        id: entryData.id,
        data: {
          termId,
          courseId: entryData.courseId,
          facultyId: entryData.facultyId,
          sectionId: entryData.sectionId,
          dayOfWeek: entryData.dayOfWeek,
          startTime: entryData.startTime,
          endTime: entryData.endTime,
          roomId: entryData.roomId,
        },
      });
    } else {
      await createEntry({
        termId,
        courseId: entryData.courseId,
        facultyId: entryData.facultyId,
        sectionId: entryData.sectionId,
        dayOfWeek: entryData.dayOfWeek,
        startTime: entryData.startTime,
        endTime: entryData.endTime,
        roomId: entryData.roomId,
      });
    }
  };

  const handleDeleteEntry = async () => {
    if (editingEntry?.id) {
      await deleteEntry(editingEntry.id);
    }
  };

  const selectedEntriesForMerge = useMemo(() => {
    if (selectedIds.length !== 2) return [];
    return selectedIds.map((id) => entries.find((e: any) => e.id === id)).filter(Boolean);
  }, [selectedIds, entries]);

  const handleConfirmMerge = async ({
    primaryEntryId,
    secondaryEntryId,
    newStartTime,
    newEndTime,
    targetCourseId,
    targetFacultyId,
    targetRoomId,
  }: {
    primaryEntryId: string;
    secondaryEntryId: string;
    newStartTime: string;
    newEndTime: string;
    targetCourseId: string;
    targetFacultyId: string;
    targetRoomId?: string;
  }) => {
    await deleteEntry(secondaryEntryId);
    await updateEntry({
      id: primaryEntryId,
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        courseId: targetCourseId,
        facultyId: targetFacultyId,
        roomId: targetRoomId || undefined,
      },
    });
    clearSelection();
    setMergeModalOpen(false);
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Timetable Management</h1>
            <Badge variant="outline" className="text-xs font-semibold tracking-wider uppercase">
              Generate &bull; Review &bull; Adjust &bull; Publish
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Automated conflict-free scheduling engine with interactive live inspector and
            drag-and-drop manual adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unsavedMoves.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
              <span className="font-semibold">
                {unsavedMoves.length} Unsaved Move{unsavedMoves.length !== 1 ? 's' : ''}
              </span>
              <Button
                size="sm"
                variant="default"
                onClick={handleSaveChanges}
                disabled={isSavingChanges}
                className="h-7 gap-1 text-xs"
              >
                <Save className="h-3 w-3" />
                {isSavingChanges ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDiscardChanges}
                disabled={isSavingChanges}
                className="text-muted-foreground hover:text-foreground h-7 px-1.5 text-xs"
                title="Discard unsaved changes"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          <TimetableConflictBadge conflictsCount={combinedConflicts.length} />
        </div>
      </div>

      {/* Toolbar with Curriculum, Program, Term, Section Selection & Actions */}
      <TimetableToolbar
        curriculumId={curriculumId}
        setCurriculumId={setCurriculumId}
        programId={programId}
        setProgramId={setProgramId}
        termId={termId}
        setTermId={setTermId}
        sectionId={sectionId}
        setSectionId={setSectionId}
        dayOfWeek={dayOfWeek}
        setDayOfWeek={setDayOfWeek}
        onGenerate={() => {
          if (rawEntries.length > 0) {
            setOverwriteWarningOpen(true);
          } else {
            setGenerationModalOpen(true);
          }
        }}
        isGenerating={isGenerating}
        onImport={() => setImportModalOpen(true)}
        onExport={handleExport}
        onPublish={() => setPublishModalOpen(true)}
        isPublishing={isPublishing}
        status={timetableStatus}
      />

      {/* Generation Running Progress & Post-Generation Result Summary */}
      <TimetableGenerationProgressBanner
        isGenerating={isGenerating}
        totalSections={
          pendingGenerationConfig?.sectionIds.length || sections.length || allSections.length || 1
        }
        sectionNames={sections.map((s) => s.name)}
        summary={generationSummary}
        onDismissSummary={() => setGenerationSummary(null)}
        onViewGenerated={(targetSecId, targetProgId) => {
          if (targetProgId) setProgramId(targetProgId);
          if (targetSecId) setSectionId(targetSecId);
        }}
      />

      {/* Overview Heatmap when "All Programs" is active */}
      {!programId && !sectionId && (
        <TimetableOverviewHeatmap
          programs={programs}
          sections={allSections}
          entries={rawEntries}
          hasTermSelected={!!termId}
          onSelectSectionAndProgram={(selectedProgId, selectedSecId) => {
            if (selectedProgId) setProgramId(selectedProgId);
            if (selectedSecId) setSectionId(selectedSecId);
          }}
        />
      )}

      {/* Section, Courses & Faculty Assignments Summary Card */}
      {(programId || sectionId) && (
        <TimetableProgramSectionsSummary
          programName={selectedProgram?.name}
          programCode={selectedProgram?.code}
          sections={sections}
          isLoading={isSectionsLoading}
          selectedSectionId={sectionId}
          onSelectSection={(secId) => setSectionId(secId)}
          isGenerating={isGenerating}
          hasTermSelected={!!termId}
        />
      )}

      {/* Section Timetable Grid & Side-by-side Conflict Reference Panel */}
      {programId || sectionId ? (
        termId ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
            {/* Left Area: Visual Weekly Timetable Grid */}
            <div className="min-w-0 space-y-4">
              <TimetableGrid
                termId={termId}
                sectionId={sectionId}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onEntryClick={handleEntryClick}
                onEmptySlotClick={handleEmptySlotClick}
                entries={entries}
                isPending={isTimetablePending}
                status={timetableStatus}
                onMoveEntry={handleMoveEntry}
                onSwapEntries={handleSwap}
                onSelectEntryForInspector={(entry) => setInspectorEntry(entry)}
              />

              {/* Bulk Actions */}
              <TimetableBulkActions
                selectedIds={selectedIds}
                onClear={clearSelection}
                onDelete={() => console.log('Bulk delete', selectedIds)}
                onMove={() => console.log('Bulk move', selectedIds)}
                onReassign={() => console.log('Bulk reassign', selectedIds)}
                onMerge={() => setMergeModalOpen(true)}
              />
            </div>

            {/* Right Area: Lightweight Context & Conflict Reference Panel */}
            <div className="min-w-0">
              <div className="sticky top-6">
                <TimetableContextConflictPanel
                  selectedEntry={inspectorEntry}
                  onClearSelection={() => setInspectorEntry(null)}
                  allEntries={rawEntries}
                  allConflicts={combinedConflicts}
                  onSelectEntry={(entry) => setInspectorEntry(entry)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            Please select an academic term above to view and manage the weekly timetable.
          </div>
        )
      ) : null}

      {/* Section Planning & Instructional Hours (when specific section is selected) */}
      {sectionId && termId && (
        <SessionPlanningCard
          sectionId={sectionId}
          sectionName={sections.find((s: any) => s.id === sectionId)?.name || 'Selected Section'}
          sectionCode={sections.find((s: any) => s.id === sectionId)?.code}
          termId={termId}
          terms={terms || []}
          onTermChange={(newTermId) => setTermId(newTermId)}
        />
      )}

      {/* Timetable Generation Modal */}
      <TimetableGenerationModal
        open={generationModalOpen}
        onOpenChange={setGenerationModalOpen}
        academicYearName={selectedAcademicYear?.name}
        termName={selectedTerm?.name}
        termId={termId}
        programs={programs}
        allSections={allSections}
        scopedSections={sections}
        selectedProgramId={programId}
        selectedSectionId={sectionId}
        courses={courses}
        existingSessionCount={rawEntries.length}
        onConfirm={handleRequestGeneration}
      />

      {/* Overwrite Confirmation Dialog with Exact Scope */}
      <TimetableOverwriteWarningDialog
        open={overwriteWarningOpen}
        onOpenChange={setOverwriteWarningOpen}
        academicYearName={selectedAcademicYear?.name}
        termName={selectedTerm?.name}
        affectedSectionsCount={
          pendingGenerationConfig?.sectionIds.length ||
          (sectionId ? 1 : sections.length || allSections.length || 0)
        }
        affectedSessionsCount={
          pendingGenerationConfig
            ? rawEntries.filter((e: any) =>
                pendingGenerationConfig.sectionIds.includes(e.sectionId),
              ).length
            : rawEntries.length
        }
        onConfirm={() => {
          if (pendingGenerationConfig) {
            executeGeneration(pendingGenerationConfig);
          } else {
            setGenerationModalOpen(true);
          }
        }}
        isGenerating={isGenerating}
      />

      {/* Publishing Modal */}
      <TimetablePublishModal
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        academicYearName={selectedAcademicYear?.name}
        termName={selectedTerm?.name}
        sectionsCount={sections.length || allSections.length}
        totalSessions={entries.length}
        conflicts={combinedConflicts}
        onConfirmPublish={handleConfirmPublish}
        isPublishing={isPublishing}
      />

      {/* Merge Two Slots Modal */}
      <TimetableMergeModal
        open={mergeModalOpen}
        onOpenChange={setMergeModalOpen}
        entries={selectedEntriesForMerge}
        onConfirmMerge={handleConfirmMerge}
        isSubmitting={isUpdating || isDeleting}
      />

      {/* Slot Create / Edit Modal */}
      <TimetableEntryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingEntry(null);
        }}
        entry={editingEntry}
        allEntries={entries}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        isSaving={isCreating || isUpdating || isDeleting}
      />

      {/* Import Modal */}
      <TimetableImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
