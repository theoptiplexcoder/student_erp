'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, Button } from '@student-erp/ui';
import { useStudentCalendar } from '@student-erp/hooks';
import { Clock } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

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

export function CalendarView() {
  const [filter, setFilter] = useState('all');
  const { data: events = [], isPending } = useStudentCalendar();
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('public:calendar_events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_events' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['student', 'calendar'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filters = [
    { id: 'all', label: 'All Events' },
    { id: 'ACADEMIC', label: 'Academic' },
    { id: 'EXAM', label: 'Exams' },
    { id: 'DEADLINE', label: 'Deadlines' },
    { id: 'HOLIDAY', label: 'Holidays' },
    { id: 'EVENT', label: 'General Events' },
  ];

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e: any) => e.eventType === filter);
  }, [events, filter]);

  const calEvents = useMemo<BigCalendarEvent[]>(() => {
    return filteredEvents.map((e: any) => ({
      id: e.id,
      title: e.title,
      start: new Date(e.startAt),
      end: new Date(e.endAt),
      allDay: e.isAllDay,
      resource: e,
    }));
  }, [filteredEvents]);

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

  if (isPending) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  // Find upcoming deadlines specifically for the side panel
  const upcomingDeadlines = events
    .filter((e: any) => e.startAt && new Date(e.startAt) >= new Date())
    .sort((a: any, b: any) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="flex flex-col gap-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filters.map((f) => (
              <Button
                key={f.id}
                variant={filter === f.id ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.slice(0, 5).map((d: any) => (
                <div
                  key={`d-${d.id}`}
                  className="border-primary flex flex-col gap-1 border-l-2 pl-3 text-sm"
                >
                  <span className="font-medium">{d.title}</span>
                  <span className="text-muted-foreground flex items-center text-xs">
                    <Clock className="mr-1 h-3 w-3" /> {new Date(d.startAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming events.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardContent className="p-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
