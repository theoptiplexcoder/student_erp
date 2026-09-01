'use client';

import React, { useState } from 'react';
import { TimetableGrid } from '@/components/admin/timetable/timetable-grid';
import { TimetableToolbar } from '@/components/admin/timetable/timetable-toolbar';
import { TimetableBulkActions } from '@/components/admin/timetable/timetable-bulk-actions';
import { TimetableEntryForm } from '@/components/admin/timetable/timetable-entry-form';
import { useAdminTimetableConflicts } from '@student-erp/hooks';
import { TimetableConflictBadge } from '@/components/admin/timetable/timetable-conflict-badge';

export default function AdminTimetablePage() {
  const [termId, setTermId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const { data: conflicts } = useAdminTimetableConflicts(termId);

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
        onGenerate={() => console.log('Generate clicked')}
        onImport={() => console.log('Import clicked')}
        onExport={() => console.log('Export clicked')}
        onPublish={() => console.log('Publish clicked')}
      />

      <TimetableGrid
        termId={termId}
        sectionId={sectionId}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onEntryClick={handleEntryClick}
        onEmptySlotClick={handleEmptySlotClick}
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
    </div>
  );
}
