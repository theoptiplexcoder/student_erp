import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@student-erp/ui";
import { upcomingDeadlines } from "@/lib/mock/student/data";
import { Clock, FileText } from "lucide-react";
import { Badge } from "@student-erp/ui";

export function UpcomingDeadlinesCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex gap-3">
                <div className="mt-0.5 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{deadline.title}</p>
                    <Badge variant={deadline.status === "SUBMITTED" ? "secondary" : "default"} className="text-[10px] uppercase">
                      {deadline.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="font-medium mr-2">{deadline.course}</span>
                    <Clock className="mr-1 h-3 w-3" />
                    {deadline.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-20" />
            <p>No upcoming deadlines.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
