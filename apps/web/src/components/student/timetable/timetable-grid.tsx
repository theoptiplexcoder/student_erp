import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { todaysSchedule } from '@/lib/mock/student/data';
import { Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@student-erp/ui';

export function TimetableGrid() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-4 font-medium">Current Week</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default">Today</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {days.map((day, idx) => (
          <Card key={day} className={idx === 2 ? 'border-primary' : ''}>
            <CardHeader className="bg-muted/50 px-4 py-3">
              <CardTitle className="text-center text-sm font-medium">{day}</CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-[400px] flex-col gap-3 p-4">
              {idx === 2 ? (
                todaysSchedule.map((cls, i) => (
                  <div
                    key={i}
                    className="bg-primary/10 border-primary/20 hover:bg-primary/20 cursor-pointer rounded-md border p-3 text-sm transition-colors"
                  >
                    <div className="text-primary font-semibold">{cls.courseCode}</div>
                    <div className="mb-2 truncate text-xs font-medium">{cls.courseName}</div>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" /> {cls.startTime} - {cls.endTime}
                    </div>
                    <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3" /> {cls.room}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground flex flex-1 items-center justify-center rounded-md border border-dashed p-4 text-center text-xs">
                  No classes scheduled
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
