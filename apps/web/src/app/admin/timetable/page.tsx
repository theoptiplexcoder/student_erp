'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { TimetableGrid } from '@/components/admin/timetable/timetable-grid';
import { TimetableToolbar } from '@/components/admin/timetable/timetable-toolbar';
import { TimetableBulkActions } from '@/components/admin/timetable/timetable-bulk-actions';
import { TimetableEntryForm } from '@/components/admin/timetable/timetable-entry-form';
import { TimetableSessionSettings } from '@/components/admin/timetable/timetable-session-settings';
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
} from '@student-erp/hooks';
import { TimetableConflictBadge } from '@/components/admin/timetable/timetable-conflict-badge';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';
import { TimetableImportModal } from '@/components/admin/timetable/timetable-import-modal';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  FACULTY: 'Faculty Conflicts (Overlapping Teacher Schedule)',
  SECTION: 'Section Conflicts (Overlapping Section Classes)',
  ROOM: 'Room Conflicts (Classroom Double-Booking)',
  UNSCHEDULED: 'Unscheduled Sessions',
};

function ConflictAlert({ conflicts }: { conflicts: any[] }) {
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({
    FACULTY: true,
    ROOM: true,
    SECTION: true,
  });

  const grouped = conflicts.reduce<Record<string, any[]>>((acc, c) => {
    const type = c.type || 'OTHER';
    if (!acc[type]) acc[type] = [];
    acc[type].push(c);
    return acc;
  }, {});

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
      <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
        <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
        <span>
          {conflicts.length} Overlapping Conflict{conflicts.length !== 1 ? 's' : ''} Detected in
          Timetable
        </span>
      </div>

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="border-t border-red-200/60 pt-2 dark:border-red-800/60">
          <button
            type="button"
            className="flex w-full items-center justify-between text-xs font-medium text-red-800 hover:underline sm:text-sm dark:text-red-300"
            onClick={() => toggleType(type)}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-200/70 px-2 py-0.5 text-xs font-semibold text-red-900 dark:bg-red-900 dark:text-red-200">
                {items.length}
              </span>
              <span>{CONFLICT_TYPE_LABELS[type] || type}</span>
            </div>
            {expandedTypes[type] ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedTypes[type] && (
            <ul className="mt-1.5 ml-4 list-disc space-y-1 text-xs text-red-700 dark:text-red-300">
              {items.map((conflict, i) => (
                <li key={i}>
                  {conflict.message ||
                    `${conflict.type} conflict at ${conflict.time || 'unknown time'}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminTimetablePage() {
  const [programId, setProgramId] = useState('');
  const [termId, setTermId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [sessionSettingsOpen, setSessionSettingsOpen] = useState(false);
  const [generationConflicts, setGenerationConflicts] = useState<any[]>([]);

  // Metadata queries
  const { data: programsResponse } = useAdminPrograms(1, 100);
  const { data: terms } = useAdminTerms();
  // Fetch all sections across programs so all-programs heatmap has the full cross-program view
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

  const programs = programsResponse?.data || [];
  const selectedProgram = programs.find((p: any) => p.id === programId);
  const allSections = allSectionsResponse?.data || [];
  const sections = programId ? programSectionsResponse?.data || [] : allSections;
  const isSectionsLoading = programId ? isProgramSectionsLoading : isAllSectionsLoading;

  // Auto-select active/first term when terms load if none selected
  useEffect(() => {
    if (!termId && terms && terms.length > 0) {
      setTermId(terms[0].id);
    }
  }, [terms, termId]);

  // Timetable data & conflict queries
  const { data: serverConflicts } = useAdminTimetableConflicts(termId);
  const { data: timetableData, isPending: isTimetablePending } = useAdminTimetable({
    termId,
    sectionId: sectionId || undefined,
    facultyId: facultyId || undefined,
    dayOfWeek: dayOfWeek || undefined,
  });

  const { mutate: generateTimetable, isPending: isGenerating } = useGenerateTimetable();
  const { mutate: publishTimetable, isPending: isPublishing } = usePublishTimetable();
  const { mutate: exportTimetable } = useExportTimetable();
  const { mutate: importTimetable } = useImportTimetable();
  const { mutate: swapSlots } = useSwapTimetableSlots();

  const { mutateAsync: createEntry, isPending: isCreating } = useCreateTimetableEntry();
  const { mutateAsync: updateEntry, isPending: isUpdating } = useUpdateTimetableEntry();
  const { mutateAsync: deleteEntry, isPending: isDeleting } = useDeleteTimetableEntry();

  const rawEntries = Array.isArray(timetableData)
    ? timetableData
    : (timetableData as any)?.data || [];

  // Filter entries to program sections if program is selected
  const entries = useMemo(() => {
    if (!programId || sections.length === 0) return rawEntries;
    const programSecIds = new Set(sections.map((s: any) => s.id));
    return rawEntries.filter((e: any) => programSecIds.has(e.sectionId));
  }, [rawEntries, programId, sections]);

  const timetableStatus = 'NO_TIMETABLE';

  // Live client-side conflicts calculated across the active entries
  const clientConflicts = useMemo<TimetableConflict[]>(() => {
    return findTimetableConflicts(entries);
  }, [entries]);

  // Combined conflict list for header badge & banner
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

    // First collect from program sections
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

    // Then add from existing entries
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

  const handlePublish = () => {
    if (!termId) return;
    publishTimetable(termId, {
      onSuccess: () => alert('Timetable published successfully'),
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

  const handleGenerate = (settings?: {
    defaultSessionDuration: number;
    sessionDurations: Record<string, number>;
    workingHours?: { start: string; end: string };
  }) => {
    if (!termId) {
      alert('Please select a term to generate the weekly timetable.');
      return;
    }

    // Confirm before overwriting existing schedule
    if (entries.length > 0) {
      const confirmed = window.confirm(
        'Generating a new timetable will overwrite existing schedules for this term. Do you wish to proceed?',
      );
      if (!confirmed) return;
    }

    let sectionIds: string[] = [];
    if (sectionId) {
      sectionIds = [sectionId];
    } else if (sections.length > 0) {
      sectionIds = sections.map((s) => s.id);
    }

    if (sectionIds.length === 0) {
      alert('No sections found to generate timetable. Please select a program with sections.');
      return;
    }

    generateTimetable(
      {
        termId,
        sectionIds,
        ...(settings?.defaultSessionDuration
          ? { defaultSessionDuration: settings.defaultSessionDuration }
          : {}),
        ...(settings?.sessionDurations && Object.keys(settings.sessionDurations).length > 0
          ? { sessionDurations: settings.sessionDurations }
          : {}),
        ...(settings?.workingHours ? { workingHours: settings.workingHours } : {}),
      },
      {
        onSuccess: (response: any) => {
          const newConflicts = response?.conflicts || [];
          const newSummary = response?.summary || null;
          setGenerationConflicts(newConflicts);

          if (newConflicts.length > 0) {
            const sessionCount = newSummary?.totalSessions ?? newSummary?.total ?? entries.length;
            alert(
              `Generated ${sessionCount} weekly sessions. ${newConflicts.length} conflict${newConflicts.length !== 1 ? 's' : ''} detected. Review highlighted slots.`,
            );
          } else {
            alert('Weekly timetable generated successfully!');
          }
        },
        onError: (err: any) => {
          alert('Failed to generate timetable: ' + err.message);
        },
      },
    );
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleEntryClick = (entry: any) => {
    setEditingEntry(entry);
    setFormOpen(true);
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

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Timetable Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Generate and manage weekly schedules with real-time overlap collision warnings.
          </p>
        </div>
        <TimetableConflictBadge conflictsCount={combinedConflicts.length} />
      </div>

      {/* Toolbar with Program & Term Filter Controls */}
      <TimetableToolbar
        programId={programId}
        setProgramId={setProgramId}
        termId={termId}
        setTermId={setTermId}
        sectionId={sectionId}
        setSectionId={setSectionId}
        facultyId={facultyId}
        setFacultyId={setFacultyId}
        dayOfWeek={dayOfWeek}
        setDayOfWeek={setDayOfWeek}
        onGenerate={() => setSessionSettingsOpen(true)}
        isGenerating={isGenerating}
        onImport={() => setImportModalOpen(true)}
        onExport={handleExport}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        status={timetableStatus}
      />

      {/* Heatmap Overview when "All Programs" is selected (programId === '') */}
      {!programId && (
        <TimetableOverviewHeatmap
          programs={programs}
          sections={allSections}
          entries={rawEntries}
          hasTermSelected={!!termId}
          onGenerateClick={() => setSessionSettingsOpen(true)}
          onSelectSectionAndProgram={(selectedProgId, selectedSecId) => {
            if (selectedProgId) setProgramId(selectedProgId);
            if (selectedSecId) setSectionId(selectedSecId);
          }}
        />
      )}

      {/* Program Sections, Courses & Faculty Overview Card (when specific program is chosen) */}
      {programId && (
        <TimetableProgramSectionsSummary
          programName={selectedProgram?.name}
          programCode={selectedProgram?.code}
          sections={sections}
          isLoading={isSectionsLoading}
          selectedSectionId={sectionId}
          onSelectSection={(secId) => setSectionId(secId)}
          onGenerateClick={() => setSessionSettingsOpen(true)}
          isGenerating={isGenerating}
          hasTermSelected={!!termId}
        />
      )}

      {/* Overlapping Conflict Alert Banner */}
      {combinedConflicts.length > 0 && <ConflictAlert conflicts={combinedConflicts} />}

      {/* Timetable Grid */}
      {termId ? (
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
          onSwapEntries={handleSwap}
        />
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
          Please select a term above to view and manage the weekly timetable.
        </div>
      )}

      {/* Bulk Actions */}
      <TimetableBulkActions
        selectedIds={selectedIds}
        onClear={clearSelection}
        onDelete={() => console.log('Bulk delete', selectedIds)}
        onMove={() => console.log('Bulk move', selectedIds)}
        onReassign={() => console.log('Bulk reassign', selectedIds)}
      />

      {/* Entry Create / Edit Modal with Real-time Collision Detection */}
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

      {/* Session Settings & Generation Modal */}
      <TimetableSessionSettings
        open={sessionSettingsOpen}
        onOpenChange={setSessionSettingsOpen}
        onConfirm={handleGenerate}
        courses={courses}
      />
    </div>
  );
}
