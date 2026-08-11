"use client";
import React, { useState } from "react";
import { User, Users, BookOpen, FileCheck, CheckCircle2 } from "lucide-react";

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Guardian Details", icon: Users },
  { id: 3, title: "Academic Record", icon: BookOpen },
  { id: 4, title: "Documents", icon: FileCheck },
];

export function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Stepper */}
      <div className="mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 -translate-y-1/2" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                    isCurrent ? "bg-background border-primary text-primary" :
                    "bg-background border-border text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium ${isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content Area */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 md:p-8 min-h-[400px]">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-display font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input type="text" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input type="text" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Enter last name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <input type="date" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                  <option>Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Email Address</label>
                <input type="email" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none" placeholder="name@example.com" />
              </div>
            </div>
          </div>
        )}

        {currentStep > 1 && (
          <div className="flex flex-col items-center justify-center h-[300px] text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              {React.createElement(steps[currentStep-1].icon, { className: "h-8 w-8 text-primary" })}
            </div>
            <h3 className="font-semibold text-lg">{steps[currentStep-1].title}</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Form fields for {steps[currentStep-1].title.toLowerCase()} will be placed here in the production implementation.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2 rounded-md border border-border text-sm font-medium hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {currentStep < steps.length ? (
          <button 
            onClick={nextStep}
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Next Step
          </button>
        ) : (
          <button 
            onClick={() => window.location.href = '/tenant-admin/students'}
            className="px-6 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Submit Registration
          </button>
        )}
      </div>
    </div>
  );
}
