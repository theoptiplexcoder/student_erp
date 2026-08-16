import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { upcomingDeadlines } from '@/lib/mock/student/data';
import { Clock, FileText } from 'lucide-react';
import { Badge } from '@student-erp/ui';

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
                <div className="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm leading-none font-medium">{deadline.title}</p>
                    <Badge
                      variant={deadline.status === 'SUBMITTED' ? 'secondary' : 'default'}
                      className="text-[10px] uppercase"
                    >
                      {deadline.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center text-xs">
                    <span className="mr-2 font-medium">{deadline.course}</span>
                    <Clock className="mr-1 h-3 w-3" />
                    {deadline.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-6 text-center">
            <FileText className="mb-2 h-8 w-8 opacity-20" />
            <p>No upcoming deadlines.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
