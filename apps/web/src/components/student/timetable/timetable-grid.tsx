import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@student-erp/ui";
import { todaysSchedule } from "@/lib/mock/student/data";
import { Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@student-erp/ui";

export function TimetableGrid() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-medium px-4">Current Week</span>
          <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default">Today</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map((day, idx) => (
          <Card key={day} className={idx === 2 ? "border-primary" : ""}>
            <CardHeader className="py-3 px-4 bg-muted/50">
              <CardTitle className="text-sm font-medium text-center">{day}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3 min-h-[400px]">
              {idx === 2 ? (
                todaysSchedule.map((cls, i) => (
                  <div key={i} className="bg-primary/10 border border-primary/20 rounded-md p-3 text-sm hover:bg-primary/20 transition-colors cursor-pointer">
                    <div className="font-semibold text-primary">{cls.courseCode}</div>
                    <div className="truncate text-xs font-medium mb-2">{cls.courseName}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {cls.startTime} - {cls.endTime}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {cls.room}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-xs text-center border border-dashed rounded-md p-4">
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
