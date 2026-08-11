"use client";

import React, { useState, useEffect } from "react";
import { AttendanceSummary } from "./AttendanceSummary";
import { AttendanceFilters, FilterStatus } from "./AttendanceFilters";
import { AttendanceSessionList } from "./AttendanceSessionList";
import { mockSubjectAttendance, MockAttendanceSession, AttendanceStatus } from "@/lib/mock/student/data";
import { Skeleton } from "@student-erp/ui";

interface CourseAttendanceProps {
  courseId: string;
}

export function CourseAttendance({ courseId }: CourseAttendanceProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");
  const [sessions, setSessions] = useState<MockAttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    setIsLoading(true);
    setError(null);
    
    const fetchAttendance = () => {
      try {
        // Mock API delay
        setTimeout(() => {
          const data = mockSubjectAttendance[courseId] || [];
          setSessions(data);
          setIsLoading(false);
        }, 600);
      } catch (err) {
        setError("Unable to load attendance records.");
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [courseId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card">
        <p className="text-destructive mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-9 w-20 rounded-full" />)}
        </div>
        <div className="space-y-4 border rounded-xl p-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const present = sessions.filter(s => s.status === "PRESENT").length;
  const absent = sessions.filter(s => s.status === "ABSENT").length;
  const late = sessions.filter(s => s.status === "LATE").length;
  const excused = sessions.filter(s => s.status === "EXCUSED").length;
  
  // Calculate percentage (Present + Late usually count as present in standard calculations, or just Present depending on policy)
  // We'll use (Present + Late) / (Total - Excused) for standard ERP logic if needed, 
  // but let's just do (Present / Total) for simplicity unless specified otherwise.
  // Actually, standard is usually (Present + Late) / Total
  const percentage = totalSessions > 0 ? Math.round(((present + late) / totalSessions) * 100) : 0;

  return (
    <div className="space-y-6">
      <AttendanceSummary 
        percentage={percentage}
        totalSessions={totalSessions}
        present={present}
        absent={absent}
        late={late}
        excused={excused}
        threshold={75}
      />
      
      <div className="mt-8">
        <AttendanceFilters 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
        />
        
        <AttendanceSessionList 
          sessions={sessions} 
          activeFilter={activeFilter} 
        />
      </div>
    </div>
  );
}
