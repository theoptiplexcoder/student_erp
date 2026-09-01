'use client';

import React, { useState, useEffect } from 'react';
import { useAdminTimetable, useMoveTimetableEntry, useDeleteTimetableEntry, useSwapTimetableSlots } from '@student-erp/hooks';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';
import { Skeleton, Card, CardHeader, CardTitle, CardContent, Button } from '@student-erp/ui';
import { ChevronLeft, ChevronRight, User, MapPin } from 'lucide-react';
import { TimetableContextMenu } from '../../../../components/admin/timetable/timetable-context-menu';
import { FacultyReassignModal } from '../../../../components/admin/timetable/faculty-reassign-modal';

function formatTime(timeString: string | Date) {
  if (!timeString) return '';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return String(timeString).substring(11, 16);
  const h = date.getUTCHours().toString().padStart(2, '0');
  const m = date.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function WeeklyTimetablePage() {
  const [termId, setTermId] = useState<string>(''); 
  const { data: terms } = useAdminTerms();
  
  useEffect(() => {
    if (terms && terms.length > 0 && !termId) {
      setTermId(terms[0].id);
    }
  }, [terms, termId]);

  const { data: timetable, isPending } = useAdminTimetable({ termId });
  const moveMutation = useMoveTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();
  const swapMutation = useSwapTimetableSlots();
  
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number } | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  
  const displayDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  // Drag and Drop state
  const [draggedEntry, setDraggedEntry] = useState<any>(null);

  if (isPending) {
    return <div className="p-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-[600px] w-full" /></div>;
  }

  const entries = Array.isArray(timetable) ? timetable : (timetable as any)?.data || [];

  const timeSlotsSet = new Set<string>();
  entries.forEach((entry: any) => {
    timeSlotsSet.add(`${formatTime(entry.startTime)}-${formatTime(entry.endTime)}`);
  });
  if (timeSlotsSet.size === 0) {
    timeSlotsSet.add('08:00-09:00');
    timeSlotsSet.add('09:00-10:00');
    timeSlotsSet.add('10:00-11:00');
  }
  const timeSlots = Array.from(timeSlotsSet).sort((a, b) => a.localeCompare(b));

  const handleContextMenu = (e: React.MouseEvent, entry: any) => {
    e.preventDefault();
    setSelectedEntry(entry);
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY });
  };

  const handleDragStart = (e: React.DragEvent, entry: any) => {
    setDraggedEntry(entry);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetSlot: string) => {
    e.preventDefault();
    if (!draggedEntry) return;
    
    const [start, end] = targetSlot.split('-');
    
    // Check if target has an entry to swap
    const targetEntries = entries.filter((ent: any) => 
      ent.dayOfWeek === targetDay && 
      `${formatTime(ent.startTime)}-${formatTime(ent.endTime)}` === targetSlot
    );
    
    if (targetEntries.length > 0) {
      // For simplicity, swap with first entry in slot
      swapMutation.mutate({ entryIdA: draggedEntry.id, entryIdB: targetEntries[0].id });
    } else {
      // Move to empty slot
      // We need to pass proper time strings for backend. Simple mock:
      const today = new Date().toISOString().split('T')[0];
      const newStartTime = new Date(`${today}T${start}:00Z`).toISOString();
      const newEndTime = new Date(`${today}T${end}:00Z`).toISOString();
      
      moveMutation.mutate({
        id: draggedEntry.id,
        data: {
          dayOfWeek: targetDay,
          startTime: newStartTime,
          endTime: newEndTime,
        }
      });
    }
    
    setDraggedEntry(null);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Weekly Timetable</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><ChevronLeft className="mr-1 h-4 w-4" /> Prev Week</Button>
            <Button variant="outline" size="sm">Next Week <ChevronRight className="ml-1 h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border text-sm">
              <thead>
                <tr>
                  <th className="bg-muted border border-border p-3 w-32 text-left font-medium">Time</th>
                  {displayDays.map(day => (
                    <th key={day} className="bg-muted border border-border p-3 text-center font-medium capitalize">
                      {day.toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => {
                  const [start, end] = slot.split('-');
                  return (
                    <tr key={slot}>
                      <td className="border border-border p-3 align-top text-muted-foreground whitespace-nowrap">
                        {start} - {end}
                      </td>
                      {displayDays.map(day => {
                        const cellEntries = entries.filter((e: any) => e.dayOfWeek === day && `${formatTime(e.startTime)}-${formatTime(e.endTime)}` === slot);
                        return (
                          <td 
                            key={`${day}-${slot}`}
                            className="border border-border p-2 align-top h-32 min-w-[160px] hover:bg-muted/30 transition-colors"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day, slot)}
                          >
                            <div className="flex flex-col gap-2 h-full">
                              {cellEntries.map((entry: any) => (
                                <div
                                  key={entry.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, entry)}
                                  onContextMenu={(e) => handleContextMenu(e, entry)}
                                  className="relative p-2 rounded border bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-ring transition-all group"
                                >
                                  <div className="font-semibold text-xs line-clamp-2">
                                    {entry.course?.name || entry.courseId}
                                  </div>
                                  <div className="text-[10px] opacity-80 mb-1">{entry.section?.name || entry.sectionId}</div>
                                  <div className="flex items-center gap-1 text-[10px] opacity-90">
                                    <User className="h-3 w-3" /> <span className="truncate">{entry.faculty?.user?.lastName || entry.facultyId}</span>
                                  </div>
                                  {entry.roomId && (
                                    <div className="flex items-center gap-1 text-[10px] opacity-90">
                                      <MapPin className="h-3 w-3" /> <span className="truncate">{entry.roomId}</span>
                                    </div>
                                  )}
                                  
                                  {/* Inline edit hint on hover */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-1 text-[10px] cursor-pointer">
                                    Edit
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {contextMenu && selectedEntry && (
        <TimetableContextMenu
          isOpen={contextMenu.isOpen}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onMove={() => {
            const target = window.prompt('Enter target day and time (e.g., MONDAY 09:00)');
            if (target) {
              const [day, time] = target.split(' ');
              if (day && time) {
                const today = new Date().toISOString().split('T')[0];
                const newStartTime = new Date(`${today}T${time}:00Z`).toISOString();
                moveMutation.mutate({
                  id: selectedEntry.id,
                  data: {
                    dayOfWeek: day,
                    startTime: newStartTime,
                  }
                });
              }
            }
          }}
          onSwap={() => {
            const targetId = window.prompt('Enter ID of entry to swap with');
            if (targetId) {
              swapMutation.mutate({ entryIdA: selectedEntry.id, entryIdB: targetId });
            }
          }}
          onReassign={() => {
            setReassignModalOpen(true);
          }}
          onDelete={() => {
            if (window.confirm('Are you sure you want to delete this entry?')) {
              deleteMutation.mutate(selectedEntry.id);
            }
          }}
        />
      )}

      {selectedEntry && (
        <FacultyReassignModal
          isOpen={reassignModalOpen}
          onClose={() => { setReassignModalOpen(false); setSelectedEntry(null); }}
          entryId={selectedEntry.id}
          currentFacultyName={selectedEntry.faculty?.user?.lastName || selectedEntry.facultyId}
        />
      )}
    </div>
  );
}
