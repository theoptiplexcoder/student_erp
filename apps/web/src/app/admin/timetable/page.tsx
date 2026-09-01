'use client';

import React, { useState } from 'react';
import { TimetableGrid } from '@/components/admin/timetable/timetable-grid';
import { TimetableToolbar } from '@/components/admin/timetable/timetable-toolbar';
import { TimetableBulkActions } from '@/components/admin/timetable/timetable-bulk-actions';
import { TimetableEntryForm } from '@/components/admin/timetable/timetable-entry-form';
import { TimetableSessionSettings } from '@/components/admin/timetable/timetable-session-settings';
import { useAdminTimetableConflicts, useGenerateTimetable, useAdminTimetable, usePublishTimetable, useExportTimetable, useImportTimetable } from '@student-erp/hooks';
import { TimetableConflictBadge } from '@/components/admin/timetable/timetable-conflict-badge';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { TimetableImportModal } from '@/components/admin/timetable/timetable-import-modal';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  FACULTY: 'Faculty Conflicts',
  SECTION: 'Section Conflicts',
  ROOM: 'Room Conflicts',
  UNSCHEDULED: 'Unscheduled Sessions',
};

function ConflictAlert({ conflicts }: { conflicts: any[] }) {
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});

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
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 text-red-800 font-medium text-sm">
        <AlertTriangle className="h-4 w-4" />
        {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} found
      </div>

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="border-t border-red-100 pt-2">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-red-700 hover:underline w-full"
            onClick={() => toggleType(type)}
          >
            {expandedTypes[type] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
            {CONFLICT_TYPE_LABELS[type] || type}
          </button>

          {expandedTypes[type] && (
            <ul className="mt-1 ml-5 space-y-1">
              {items.map((conflict, i) => (
                <li key={i} className="text-sm text-red-600">
                  {conflict.message || `${conflict.type} conflict at ${conflict.time || 'unknown time'}`}
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
  const [termId, setTermId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [sessionSettingsOpen, setSessionSettingsOpen] = useState(false);
  const [generationConflicts, setGenerationConflicts] = useState<any[]>([]);
  const [generationSummary, setGenerationSummary] = useState<any>(null);

  const { data: conflicts } = useAdminTimetableConflicts(termId);
  const { data: timetableData, isPending: isTimetablePending } = useAdminTimetable({ termId, sectionId });
  const { mutate: generateTimetable, isPending: isGenerating } = useGenerateTimetable();
  const { mutate: publishTimetable, isPending: isPublishing } = usePublishTimetable();
  const { mutate: exportTimetable } = useExportTimetable();
  const { mutate: importTimetable } = useImportTimetable();
  const { data: sectionsResponse } = useAdminSections(1, 100);

  const entries = Array.isArray(timetableData) ? timetableData : (timetableData as any)?.data || [];
  const currentTimetable = entries.length > 0 && entries[0].timetable ? entries[0].timetable : null;
  const timetableStatus = currentTimetable?.status || 'NO_TIMETABLE';

  // Derive courses from timetable entries
  const courses = React.useMemo(() => {
    const seen = new Set<string>();
    const result: Array<{ id: string; name: string; code: string; credits: number; isPractical: boolean }> = [];
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
  }, [entries]);

  const handlePublish = () => {
    if (!termId) return;
    publishTimetable(termId, {
      onSuccess: () => alert('Timetable published successfully'),
      onError: (err: any) => alert('Failed to publish timetable: ' + err.message)
    });
  };

  const handleExport = () => {
    if (!termId) return;
    exportTimetable({ termId, format: 'csv' }, {
      onSuccess: (data: any) => {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timetable-${termId}.csv`;
        a.click();
      },
      onError: (err: any) => alert('Failed to export timetable: ' + err.message)
    });
  };

  const handleImport = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (termId) formData.append('termId', termId);

    importTimetable(formData, {
      onSuccess: () => alert('Timetable imported successfully'),
      onError: (err: any) => alert('Failed to import timetable: ' + err.message)
    });
  };

  const handleGenerate = (settings?: { defaultSessionDuration: number; sessionDurations: Record<string, number> }) => {
    if (!termId) {
      alert('Please select a term to generate timetable');
      return;
    }
    
    let sectionIds: string[] = [];
    if (sectionId) {
      sectionIds = [sectionId];
    } else if (sectionsResponse?.data) {
      sectionIds = sectionsResponse.data.map(s => s.id);
    }
    
    if (sectionIds.length === 0) {
      alert('No sections available to generate timetable');
      return;
    }
    
    generateTimetable({
      termId,
      sectionIds,
      ...(settings?.defaultSessionDuration ? { defaultSessionDuration: settings.defaultSessionDuration } : {}),
      ...(settings?.sessionDurations && Object.keys(settings.sessionDurations).length > 0 ? { sessionDurations: settings.sessionDurations } : {}),
    }, {
      onSuccess: (response: any) => {
        const newConflicts = response?.conflicts || [];
        const newSummary = response?.summary || null;
        setGenerationConflicts(newConflicts);
        setGenerationSummary(newSummary);

        if (newConflicts.length > 0) {
          const sessionCount = newSummary?.totalSessions ?? newSummary?.total ?? entries.length;
          alert(`Generated ${sessionCount} sessions. ${newConflicts.length} conflict${newConflicts.length !== 1 ? 's' : ''} found.`);
        } else {
          alert('Timetable generated successfully');
        }
      },
      onError: (err: any) => {
        alert('Failed to generate timetable: ' + err.message);
      }
    });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleEntryClick = (entry: any) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleEmptySlotClick = (day: string, startTime: string) => {
    const endHour = parseInt(startTime) + 1;
    const endStr = endHour < 10 ? `0${endHour}` : `${endHour}`;
    setEditingEntry({ 
      dayOfWeek: day, 
      startTime: `2024-01-01T${startTime}:00Z`, 
      endTime: `2024-01-01T${endStr}:00:00Z` 
    });
    setFormOpen(true);
  };

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
        <TimetableConflictBadge conflictsCount={conflicts?.length || 0} />
      </div>

      <TimetableToolbar
        termId={termId}
        setTermId={setTermId}
        sectionId={sectionId}
        setSectionId={setSectionId}
        onGenerate={() => setSessionSettingsOpen(true)}
        isGenerating={isGenerating}
        onImport={() => setImportModalOpen(true)}
        onExport={handleExport}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        status={timetableStatus}
      />

      {generationConflicts.length > 0 && (
        <ConflictAlert conflicts={generationConflicts} />
      )}

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
      />

      <TimetableBulkActions
        selectedIds={selectedIds}
        onClear={clearSelection}
        onDelete={() => console.log('Bulk delete', selectedIds)}
        onMove={() => console.log('Bulk move', selectedIds)}
        onReassign={() => console.log('Bulk reassign', selectedIds)}
      />

      <TimetableEntryForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingEntry(null);
        }}
        entry={editingEntry}
      />

      <TimetableImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />

      <TimetableSessionSettings
        open={sessionSettingsOpen}
        onOpenChange={setSessionSettingsOpen}
        onConfirm={handleGenerate}
        courses={courses}
      />
    </div>
  );
}
