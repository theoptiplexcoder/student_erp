'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, Badge } from '@student-erp/ui';
import { useStudentDashboard } from '@student-erp/hooks';
import { Clock, FileText } from 'lucide-react';

export function UpcomingDeadlinesCard() {
  const { data, isPending, isError } = useStudentDashboard();

  if (isPending) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) return null;

  const upcomingDeadlines = data.upcomingDeadlines || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-4">
            {upcomingDeadlines.map((deadline: any) => (
              <div key={deadline.id} className="flex gap-3">
                <div className="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm leading-none font-medium">{deadline.title}</p>
                    <Badge
                      variant={deadline.status === 'PUBLISHED' ? 'default' : 'secondary'}
                      className="text-[10px] uppercase"
                    >
                      {deadline.status || 'PENDING'}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center text-xs">
                    <span className="mr-2 font-medium">{deadline.course?.name}</span>
                    <Clock className="mr-1 h-3 w-3" />
                    {new Date(deadline.dueDate).toLocaleDateString()}
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
