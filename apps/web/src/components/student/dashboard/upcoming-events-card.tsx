'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { useStudentDashboard } from '@student-erp/hooks';
import { Calendar, MapPin } from 'lucide-react';

export function UpcomingEventsCard() {
  const { data, isPending: isLoading, isError: error } = useStudentDashboard();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="animate-pulse p-6 text-center">Loading events...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 text-center text-red-500">Failed to load events.</CardContent>
      </Card>
    );
  }

  const upcomingEvents = data?.upcomingEvents || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event: any) => {
              const eventDate = new Date(event.startDate || event.date);
              const monthName = eventDate.toLocaleString('default', { month: 'short' });
              const dayNum = eventDate.getDate();

              return (
                <div key={event.id} className="flex gap-4">
                  <div className="bg-muted border-border flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg border">
                    <span className="text-muted-foreground text-xs leading-none font-medium uppercase">
                      {monthName}
                    </span>
                    <span className="mt-1 text-lg leading-none font-bold">{dayNum}</span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="mb-1.5 text-sm leading-none font-medium">{event.title}</h4>
                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {event.time || 'All Day'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.location || 'Various'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="mb-2 h-8 w-8 opacity-20" />
            <p>No upcoming events.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
