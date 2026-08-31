'use client';

import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Card, CardContent, CardHeader, CardTitle } from '@student-erp/ui';
import { Calendar as CalIcon, Loader2, Info } from 'lucide-react';
import { useFacultyCalendar } from '@student-erp/hooks';

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
  resource?: any;
};

export default function FacultyCalendarPage() {
  const { data: events = [], isLoading, error } = useFacultyCalendar();

  const calEvents = useMemo<BigCalendarEvent[]>(
    () =>
      events.map((e: any) => ({
        id: e.id,
        title: e.title,
        start: new Date(e.startAt),
        end: new Date(e.endAt),
        allDay: e.isAllDay,
        resource: e,
      })),
    [events],
  );

  const eventPropGetter = React.useCallback((event: BigCalendarEvent) => {
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

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load calendar events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <CalIcon className="text-primary h-8 w-8" /> Institute Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            View events, holidays, exams, and important dates.
          </p>
        </div>
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
    </div>
  );
}
