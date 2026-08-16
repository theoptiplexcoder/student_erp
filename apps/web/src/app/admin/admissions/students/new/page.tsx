'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@student-erp/ui';
import {
  CheckCircle2,
  User,
  BookOpen,
  Users,
  IndianRupee,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useCreateDirectAdmission } from '@/hooks/api/admin/useAdmissions';

const steps = [
  {
    id: 1,
    title: 'Student Info',
    icon: User,
    fields: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone', 'address'],
  },
  {
    id: 2,
    title: 'Academic',
    icon: BookOpen,
    fields: ['academicYearId', 'programId', 'batchId', 'sectionId'],
  },
  { id: 3, title: 'Guardian', icon: Users, fields: ['fatherName', 'motherName', 'fatherPhone'] },
  { id: 4, title: 'Fee Plan', icon: IndianRupee, fields: ['totalFee', 'paymentMode'] },
];

export default function DirectAdmissionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { mutateAsync: createAdmission, isPending } = useCreateDirectAdmission();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    fatherName: '',
    motherName: '',
    fatherPhone: '',
    academicYearId: '00000000-0000-0000-0000-000000000000', // Mock academic year for now
    programId: '',
    batchId: '',
    sectionId: '',
    totalFee: 0,
    paymentMode: 'ANNUAL' as 'ANNUAL' | 'INSTALLMENTS',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
        newErrors.email = 'Invalid email';
    }
    if (step === 2) {
      if (!formData.academicYearId) newErrors.academicYearId = 'Academic Year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        email: formData.email || undefined,
        phone: formData.phone,
        address: formData.address,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        fatherPhone: formData.fatherPhone,
        academicYearId: formData.academicYearId,
        programId: formData.programId || undefined,
        batchId: formData.batchId || undefined,
        sectionId: formData.sectionId || undefined,
        feePlan:
          formData.totalFee > 0
            ? {
                totalAmount: formData.totalFee,
                currency: 'INR',
                paymentMode: formData.paymentMode,
              }
            : undefined,
      };

      const result = await createAdmission(payload);
      router.push(`/admin/students/${result.id}`);
    } catch (error) {
      console.error('Failed to create admission', error);
      alert('Failed to create admission. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Direct Admission</h1>
          <p className="text-muted-foreground mt-1">
            Enroll a student and assign an annual fee plan directly.
          </p>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="bg-border absolute top-1/2 left-0 -z-10 h-0.5 w-full -translate-y-1/2" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="bg-background flex flex-col items-center gap-2 px-2">
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

      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={onSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
                <h2 className="mb-4 text-xl font-semibold">Student Information</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <span className="text-xs text-red-500">{errors.firstName}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                    {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Education St."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
                <h2 className="mb-4 text-xl font-semibold">Academic Details</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>
                      Academic Year (Demo UUID) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="academicYearId"
                      value={formData.academicYearId}
                      onChange={handleChange}
                      placeholder="UUID"
                    />
                    {errors.academicYearId && (
                      <span className="text-xs text-red-500">{errors.academicYearId}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Program ID (Optional)</Label>
                    <Input
                      name="programId"
                      value={formData.programId}
                      onChange={handleChange}
                      placeholder="UUID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch ID (Optional)</Label>
                    <Input
                      name="batchId"
                      value={formData.batchId}
                      onChange={handleChange}
                      placeholder="UUID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section ID (Optional)</Label>
                    <Input
                      name="sectionId"
                      value={formData.sectionId}
                      onChange={handleChange}
                      placeholder="UUID"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
                <h2 className="mb-4 text-xl font-semibold">Guardian Details</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Father's Name</Label>
                    <Input
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      placeholder="Robert Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mother's Name</Label>
                    <Input
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Father's Phone</Label>
                    <Input
                      name="fatherPhone"
                      value={formData.fatherPhone}
                      onChange={handleChange}
                      placeholder="+1 987 654 321"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4 duration-300">
                <h2 className="mb-4 text-xl font-semibold">Annual Fee Assignment</h2>
                <div className="grid max-w-md grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label>Total Annual Fee (₹)</Label>
                    <Input
                      name="totalFee"
                      type="number"
                      value={formData.totalFee}
                      onChange={handleChange}
                      placeholder="80000"
                    />
                  </div>

                  {formData.totalFee > 0 && (
                    <div className="space-y-2">
                      <Label>Payment Plan</Label>
                      <select
                        name="paymentMode"
                        value={formData.paymentMode}
                        onChange={handleChange}
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="ANNUAL">Pay Annually (1 Installment)</option>
                        <option value="INSTALLMENTS">Divide into 4 Installments</option>
                      </select>

                      {formData.paymentMode === 'INSTALLMENTS' && (
                        <div className="bg-muted/30 mt-4 space-y-3 rounded-lg border p-4">
                          <p className="text-sm font-medium">Installment Schedule Preview</p>
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="text-muted-foreground flex justify-between text-sm"
                            >
                              <span>Installment {i}</span>
                              <span>₹{formData.totalFee / 4}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {currentStep < steps.length ? (
                <Button type="button" onClick={nextStep}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-admin-primary hover:bg-admin-primary/90"
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Complete Admission
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
