import React from 'react';

export default function FacultyDashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="font-display text-3xl font-bold">Faculty Portal</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Course management, attendance tracking, grading, and student mentorship.
      </p>
      <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2 text-sm">Coming soon</div>
    </div>
  );
}
