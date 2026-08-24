'use client';

import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@student-erp/ui';
import { Calendar as CalIcon, Plus, Loader2, Trash2, Info } from 'lucide-react';
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from '@/hooks/api/admin/useCalendarEvents';
import type { CalendarEvent } from '@/hooks/api/admin/useCalendarEvents';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

const EVENT_TYPES = ['ACADEMIC', 'EXAM', 'HOLIDAY', 'EVENT', 'DEADLINE', 'GENERAL'] as const;

const EVENT_TYPE_LABELS: Record<string, string> = {
  ACADEMIC: 'Academic',
  EXAM: 'Examination',
  HOLIDAY: 'Holiday',
  EVENT: 'Event',
  DEADLINE: 'Deadline',
  GENERAL: 'General',
};

const EVENT_COLORS: Record<string, { bg: string; border: string; text: string; legend: string }> = {
  HOLIDAY: { bg: '#f43f5e', border: '#e11d48', text: '#fff', legend: 'bg-rose-500' },
  EXAM: { bg: '#f59e0b', border: '#d97706', text: '#fff', legend: 'bg-amber-500' },
  ACADEMIC: { bg: '#3b82f6', border: '#2563eb', text: '#fff', legend: 'bg-blue-500' },
  EVENT: { bg: '#8b5cf6', border: '#7c3aed', text: '#fff', legend: 'bg-violet-500' },
  DEADLINE: { bg: '#ef4444', border: '#dc2626', text: '#fff', legend: 'bg-red-500' },
  GENERAL: { bg: '#6b7280', border: '#4b5563', text: '#fff', legend: 'bg-gray-500' },
};

type BigCalendarEvent = {
  id?: string | number;
  title?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  resource?: CalendarEvent;
};

const emptyForm = {
  title: '',
  description: '',
  eventType: 'ACADEMIC' as CalendarEvent['eventType'],
  startAt: '',
  endAt: '',
  location: '',
  isAllDay: false,
  programId: '',
  sectionId: '',
};

function toLocalDatetimeStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CalendarPage() {
  const { data: events = [], isLoading } = useCalendarEvents();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(emptyForm);

  const calEvents = useMemo<BigCalendarEvent[]>(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: new Date(e.startAt),
        end: new Date(e.endAt),
        allDay: e.isAllDay,
        resource: e,
      })),
    [events],
  );

  const eventPropGetter = useCallback((event: BigCalendarEvent) => {
    const colors = EVENT_COLORS[event.resource?.eventType || 'GENERAL'];
    return {
      style: {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
        borderRadius: '4px',
        fontSize: '0.8125rem',
      },
    };
  }, []);

  const openCreateDialog = (start?: Date, end?: Date) => {
    setEditingEvent(null);
    const s = start || new Date();
    const e = end || new Date(s.getTime() + 60 * 60 * 1000);
    setForm({
      ...emptyForm,
      startAt: toLocalDatetimeStr(s),
      endAt: toLocalDatetimeStr(e),
    });
    setDialogOpen(true);
  };

  const openEditDialog = (event: BigCalendarEvent) => {
    const ev = event.resource;
    if (!ev) return;
    setEditingEvent(ev);
    setForm({
      title: ev.title,
      description: ev.description || '',
      eventType: ev.eventType,
      startAt: toLocalDatetimeStr(new Date(ev.startAt)),
      endAt: toLocalDatetimeStr(new Date(ev.endAt)),
      location: ev.location || '',
      isAllDay: ev.isAllDay,
      programId: ev.programId || '',
      sectionId: ev.sectionId || '',
    });
    setDialogOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    openCreateDialog(start, end);
  };

  const handleSelectEvent = (event: BigCalendarEvent) => {
    openEditDialog(event);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.startAt || !form.endAt) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      eventType: form.eventType,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      location: form.location.trim() || undefined,
      isAllDay: form.isAllDay,
      programId: form.programId || undefined,
      sectionId: form.sectionId || undefined,
    };

    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, data: payload });
    } else {
      await createEvent.mutateAsync(payload);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    await deleteEvent.mutateAsync(editingEvent.id);
    setDialogOpen(false);
  };

  const isPending = createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <CalIcon className="text-primary h-8 w-8" /> Academic Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule events, holidays, exams, and important dates.
          </p>
        </div>
        <Button onClick={() => openCreateDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Calendar */}
        <Card className="min-w-0 flex-1">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="rbc-calendar min-h-[500px] md:min-h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={calEvents}
                  views={['month', 'week', 'day', 'agenda']}
                  selectable
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  eventPropGetter={eventPropGetter}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ minHeight: 600 }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend sidebar */}
        <Card className="w-full shrink-0 lg:w-56">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4" /> Event Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {EVENT_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-2.5">
                <div className={`h-3 w-3 rounded-sm ${EVENT_COLORS[type].legend}`} />
                <span className="text-sm">{EVENT_TYPE_LABELS[type]}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>
              {editingEvent
                ? 'Update the calendar event details.'
                : 'Add a new event to the academic calendar.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Fall Semester Begins"
              />
            </div>

            {/* Event Type */}
            <div>
              <Label>Event Type *</Label>
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={form.eventType}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    eventType: e.target.value as CalendarEvent['eventType'],
                  }))
                }
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EVENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            {/* All Day checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAllDay"
                checked={form.isAllDay}
                onChange={(e) => setForm((f) => ({ ...f, isAllDay: e.target.checked }))}
                className="border-input rounded"
              />
              <Label htmlFor="isAllDay" className="cursor-pointer">
                All-day event
              </Label>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Start *</Label>
                <Input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
                />
              </div>
              <div>
                <Label>End *</Label>
                <Input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Main Auditorium"
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <textarea
                className="border-input bg-background min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional details about this event..."
              />
            </div>
          </div>
          <DialogFooter className="flex-row justify-between gap-2 sm:flex-row">
            {editingEvent ? (
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                {deleteEvent.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1.5 h-4 w-4" />
                )}
                Delete
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isPending || !form.title.trim()}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingEvent ? (
                  'Save'
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
