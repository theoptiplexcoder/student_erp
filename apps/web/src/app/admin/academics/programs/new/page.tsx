'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Label,
  Input,
} from '@student-erp/ui';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useCreateAdminProgram } from '@/hooks/api/admin/usePrograms';
import { useAdminDepartments } from '@/hooks/api/admin/useDepartments';

const PROGRAM_LEVELS = [
  'PRIMARY',
  'SECONDARY',
  'HIGHER_SECONDARY',
  'DIPLOMA',
  'UNDERGRADUATE',
  'POSTGRADUATE',
  'DOCTORAL',
  'CERTIFICATE',
];

export default function CreateProgramPage() {
  const router = useRouter();
  const createProgram = useCreateAdminProgram();
  const { data: departmentsData, isLoading: isLoadingDepartments } = useAdminDepartments();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      level: formData.get('level') as string,
      durationYears: parseInt(formData.get('durationYears') as string, 10),
      departmentId: formData.get('departmentId') as string,
    };

    try {
      await createProgram.mutateAsync(data as any);
      router.push('/admin/academics');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to create program');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/academics" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-muted-foreground text-sm">Academics / Programs / New</div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Program</h1>
        <p className="text-muted-foreground">Add a new academic program to your institution.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
            <CardDescription>Enter the basic information for this program.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Bachelor of Science in Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Program Code</Label>
              <Input id="code" name="code" required placeholder="e.g. BSCS" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="level">Program Level</Label>
                <select
                  id="level"
                  name="level"
                  required
                  className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="UNDERGRADUATE"
                >
                  {PROGRAM_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationYears">Duration (Years)</Label>
                <Input
                  id="durationYears"
                  name="durationYears"
                  type="number"
                  min="1"
                  max="10"
                  required
                  defaultValue="4"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <select
                id="departmentId"
                name="departmentId"
                required
                disabled={isLoadingDepartments}
                className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled selected>
                  {isLoadingDepartments ? 'Loading departments...' : 'Select department'}
                </option>
                {departmentsData?.data.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoadingDepartments}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Create Program
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
