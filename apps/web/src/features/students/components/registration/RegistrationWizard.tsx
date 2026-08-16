'use client';
import React, { useState } from 'react';
import { User, Users, BookOpen, FileCheck, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Guardian Details', icon: Users },
  { id: 3, title: 'Academic Record', icon: BookOpen },
  { id: 4, title: 'Documents', icon: FileCheck },
];

export function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Progress Stepper */}
      <div className="relative mb-8">
        <div className="bg-border absolute top-1/2 left-0 -z-10 h-0.5 w-full -translate-y-1/2" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-background border-primary text-primary'
                        : 'bg-background border-border text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${isCurrent || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content Area */}
      <div className="bg-card border-border min-h-[400px] rounded-xl border p-6 shadow-sm md:p-8">
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
            <h2 className="font-display mb-4 text-xl font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input
                  type="text"
                  className="border-input bg-background focus:ring-primary h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  className="border-input bg-background focus:ring-primary h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <input
                  type="date"
                  className="border-input bg-background focus:ring-primary h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select className="border-input bg-background focus:ring-primary h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none">
                  <option>Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  className="border-input bg-background focus:ring-primary h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep > 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 flex h-[300px] flex-col items-center justify-center text-center duration-500">
            <div className="bg-primary/10 mb-4 rounded-full p-4">
              {React.createElement(steps[currentStep - 1].icon, {
                className: 'h-8 w-8 text-primary',
              })}
            </div>
            <h3 className="text-lg font-semibold">{steps[currentStep - 1].title}</h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
              Form fields for {steps[currentStep - 1].title.toLowerCase()} will be placed here in
              the production implementation.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="border-border hover:bg-accent rounded-md border px-6 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 text-sm font-medium transition-colors"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={() => (window.location.href = '/tenant-admin/students')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 text-sm font-medium transition-colors"
          >
            Submit Registration
          </button>
        )}
      </div>
    </div>
  );
}
