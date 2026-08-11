import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@student-erp/ui";
import { upcomingEvents } from "@/lib/mock/student/data";
import { Calendar, MapPin } from "lucide-react";

export function UpcomingEventsCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted border border-border flex-shrink-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase leading-none">
                    {event.date.substring(0, 3)}
                  </span>
                  <span className="text-lg font-bold leading-none mt-1">
                    {event.date.match(/\d+/)?.[0] || "1"}
                  </span>
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-sm font-medium leading-none mb-1.5">{event.title}</h4>
                  <div className="flex items-center text-xs text-muted-foreground gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
