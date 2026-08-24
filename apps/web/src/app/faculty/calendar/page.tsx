'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@student-erp/ui';
import { useFacultyCalendar } from '@student-erp/hooks';
import { Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function FacultyCalendarPage() {
  const { data: events, isLoading, error } = useFacultyCalendar();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !events) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load calendar events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Institute Calendar</h1>
        <p className="text-muted-foreground">Upcoming events and holidays</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Event Date</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground p-8 text-center">
                      No events found.
                    </td>
                  </tr>
                ) : (
                  events.map((event: any) => (
                    <tr key={event.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">
                            {format(new Date(event.startDate), 'MMM dd, yyyy')}
                            {event.endDate && event.endDate !== event.startDate
                              ? ` - ${format(new Date(event.endDate), 'MMM dd, yyyy')}`
                              : ''}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{event.title}</td>
                      <td className="p-4">
                        <Badge variant="outline">{event.eventType}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
