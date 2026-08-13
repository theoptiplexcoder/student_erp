'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Input,
} from '@student-erp/ui';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { apiClient } from '@/lib/api-client';

export default function NewStudentPage() {
  const router = useRouter();
  const { data: programsData, isLoading: isLoadingPrograms } = useAdminPrograms(1, 100);
  const programs = programsData?.data || [];

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    programId: '',
    admissionNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiClient.post('/admin/students', formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/students');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <div className="rounded-full bg-green-100 p-4 text-green-700">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Student Admitted Successfully</h2>
        <p className="text-muted-foreground">Redirecting to students list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-2 flex items-center gap-2">
        <Link href="/admin/students" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-muted-foreground text-sm">
          Students / <span className="text-foreground">New Admission</span>
        </div>
      </div>

      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">New Student Admission</h1>
        <p className="text-muted-foreground mt-1">
          Enroll a new student and assign them to an academic program.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Assignment</CardTitle>
              <CardDescription>Select the program and admission details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admissionNumber">Admission Number</Label>
                <Input
                  id="admissionNumber"
                  name="admissionNumber"
                  placeholder="e.g. ADM-2023-001"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="programId">Program *</Label>
                <select
                  id="programId"
                  name="programId"
                  required
                  value={formData.programId}
                  onChange={handleChange}
                  disabled={isLoadingPrograms}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a Program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
                {isLoadingPrograms && (
                  <p className="text-muted-foreground text-xs">Loading programs...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/students')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isLoadingPrograms}
            className="bg-admin-primary hover:bg-admin-primary/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Admission
          </Button>
        </div>
      </form>
    </div>
  );
}
