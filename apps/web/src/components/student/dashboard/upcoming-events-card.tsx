"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@student-erp/ui";
import { useStudentDashboard } from "../../../features/students/api/use-student-dashboard";
import { Calendar, MapPin } from "lucide-react";

export function UpcomingEventsCard() {
  const { data, isLoading, error } = useStudentDashboard();
  
  if (isLoading) {
    return <Card className="h-full"><CardContent className="p-6 text-center animate-pulse">Loading events...</CardContent></Card>;
  }
  
  if (error) {
    return <Card className="h-full"><CardContent className="p-6 text-center text-red-500">Failed to load events.</CardContent></Card>;
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
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted border border-border flex-shrink-0">
                    <span className="text-xs font-medium text-muted-foreground uppercase leading-none">
                      {monthName}
                    </span>
                    <span className="text-lg font-bold leading-none mt-1">
                      {dayNum}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-medium leading-none mb-1.5">{event.title}</h4>
                    <div className="flex items-center text-xs text-muted-foreground gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {event.time || "All Day"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.location || "Various"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2 opacity-20" />
            <p>No upcoming events.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
