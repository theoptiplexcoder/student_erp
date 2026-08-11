import React from "react";

export default function FacultyDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-3xl font-display font-bold">Faculty Portal</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Course management, attendance tracking, grading, and student mentorship.
      </p>
      <div className="px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
        Coming soon
      </div>
    </div>
  );
}
