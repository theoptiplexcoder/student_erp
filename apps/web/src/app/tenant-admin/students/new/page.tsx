import React from "react";
import { RegistrationWizard } from "../../../../features/students/components/registration/RegistrationWizard";
import { ChevronRight } from "lucide-react";

export default function NewStudentPage() {
  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <a href="/tenant-admin/students" className="hover:text-primary transition-colors">Students</a>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium">New Registration</span>
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Register New Student</h1>
          <p className="text-muted-foreground mt-1">Follow the steps to complete the student onboarding process.</p>
        </div>
      </div>

      <div className="flex-1 bg-background border border-border rounded-xl shadow-sm p-6 md:p-8 overflow-y-auto">
        <RegistrationWizard />
      </div>
    </div>
  );
}
