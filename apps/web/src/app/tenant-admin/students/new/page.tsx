import React from 'react';
import { RegistrationWizard } from '../../../../features/students/components/registration/RegistrationWizard';
import { ChevronRight } from 'lucide-react';

export default function NewStudentPage() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="text-muted-foreground flex items-center text-sm">
          <a href="/tenant-admin/students" className="hover:text-primary transition-colors">
            Students
          </a>
          <ChevronRight className="mx-1 h-4 w-4" />
          <span className="text-foreground font-medium">New Registration</span>
        </div>
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Register New Student</h1>
          <p className="text-muted-foreground mt-1">
            Follow the steps to complete the student onboarding process.
          </p>
        </div>
      </div>

      <div className="bg-background border-border flex-1 overflow-y-auto rounded-xl border p-6 shadow-sm md:p-8">
        <RegistrationWizard />
      </div>
    </div>
  );
}
