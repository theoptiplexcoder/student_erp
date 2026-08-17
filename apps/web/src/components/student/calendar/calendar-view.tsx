'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { useStudentDashboard } from '@student-erp/hooks';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
} from 'lucide-react';

export function CalendarView() {
  const [filter, setFilter] = useState('all');
  const { data, isPending } = useStudentDashboard();

  const filters = [
    { id: 'all', label: 'All Events' },
    { id: 'academic', label: 'Academic' },
    { id: 'exams', label: 'Exams' },
    { id: 'deadlines', label: 'Deadlines' },
  ];

  if (isPending) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  const upcomingDeadlines = data?.upcomingDeadlines || [];

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
                    <Clock className="mr-1 h-3 w-3" /> {new Date(d.dueDate).toLocaleDateString()}
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
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xl">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Today
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple mock calendar view */}
            <div className="bg-muted grid grid-cols-7 gap-px overflow-hidden rounded-md text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="bg-background text-muted-foreground py-2 font-medium">
                  {day}
                </div>
              ))}

              {/* Padding days */}
              {[27, 28, 29, 30].map((d) => (
                <div
                  key={`p-${d}`}
                  className="bg-muted/30 text-muted-foreground min-h-[80px] p-2 opacity-50"
                >
                  {d}
                </div>
              ))}

              {/* Current month days */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const isToday = d === new Date().getDate();
                const deadline = upcomingDeadlines.find(
                  (ud: any) => new Date(ud.dueDate).getDate() === d,
                );

                return (
                  <div
                    key={d}
                    className={`bg-background min-h-[80px] border-t p-2 text-left ${isToday ? 'bg-primary/5' : ''}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 rounded-full text-center leading-6 ${isToday ? 'bg-primary text-primary-foreground font-medium' : ''}`}
                    >
                      {d}
                    </span>
                    {deadline && (
                      <div className="mt-1">
                        <div className="truncate rounded bg-red-100 p-1 text-[10px] text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          {deadline.title}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
