'use client';

import React, { useState } from 'react';
import { TimetableGrid } from '@/components/admin/timetable/timetable-grid';
import { TimetableToolbar } from '@/components/admin/timetable/timetable-toolbar';
import { TimetableBulkActions } from '@/components/admin/timetable/timetable-bulk-actions';
import { TimetableEntryForm } from '@/components/admin/timetable/timetable-entry-form';
import { useAdminTimetableConflicts, useGenerateTimetable, useAdminTimetable, usePublishTimetable, useExportTimetable, useImportTimetable } from '@student-erp/hooks';
import { TimetableConflictBadge } from '@/components/admin/timetable/timetable-conflict-badge';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { TimetableImportModal } from '@/components/admin/timetable/timetable-import-modal';

export default function AdminTimetablePage() {
  const [termId, setTermId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

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

  const handleGenerate = () => {
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
    }, {
      onSuccess: () => {
        alert('Timetable generated successfully');
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
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        onImport={() => setImportModalOpen(true)}
        onExport={handleExport}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        status={timetableStatus}
      />

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
    </div>
  );
}
