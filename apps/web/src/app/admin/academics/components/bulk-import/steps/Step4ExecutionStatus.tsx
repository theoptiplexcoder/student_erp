'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@student-erp/ui';
import {
  CheckCircle2,
  AlertOctagon,
  Building2,
  BookOpen,
  GraduationCap,
  Calendar,
  Users,
} from 'lucide-react';
import { BulkIngestResponse } from '@/hooks/api/admin/useBulkAcademicImport';

interface Step4ExecutionStatusProps {
  result: BulkIngestResponse | null;
  error: Error | null;
  onClose: () => void;
  onRetry: () => void;
}

export function Step4ExecutionStatus({
  result,
  error,
  onClose,
  onRetry,
}: Step4ExecutionStatusProps) {
  if (error) {
    const serverMessage = (error as any)?.response?.data?.message;
    const displayMessage = Array.isArray(serverMessage)
      ? serverMessage.join(', ')
      : serverMessage ||
        error.message ||
        'An unexpected error occurred during database commit. No partial data was saved.';

    return (
      <div className="space-y-6 py-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertOctagon className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-900">Ingestion Transaction Failed</h3>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm font-medium">
            {displayMessage}
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </div>
    );
  }

  const summary = result?.countSummary || {
    departments: 0,
    courses: 0,
    programs: 0,
    terms: 0,
    sections: 0,
  };

  return (
    <div className="space-y-6 py-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-3 text-xl font-bold text-green-900">
          Academic Structure Successfully Imported!
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          All entities have been committed to the database in strict 3NF with verified progression
          links.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 text-center sm:grid-cols-5">
        <Card className="border-border">
          <CardContent className="flex flex-col items-center p-4">
            <Building2 className="mb-1 h-6 w-6 text-blue-600" />
            <div className="text-foreground text-2xl font-bold">{summary.departments}</div>
            <div className="text-muted-foreground text-xs">Departments</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex flex-col items-center p-4">
            <BookOpen className="mb-1 h-6 w-6 text-green-600" />
            <div className="text-foreground text-2xl font-bold">{summary.courses}</div>
            <div className="text-muted-foreground text-xs">Courses</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex flex-col items-center p-4">
            <GraduationCap className="mb-1 h-6 w-6 text-purple-600" />
            <div className="text-foreground text-2xl font-bold">{summary.programs}</div>
            <div className="text-muted-foreground text-xs">Programs</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex flex-col items-center p-4">
            <Calendar className="mb-1 h-6 w-6 text-amber-600" />
            <div className="text-foreground text-2xl font-bold">{summary.terms}</div>
            <div className="text-muted-foreground text-xs">Curriculum Terms</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex flex-col items-center p-4">
            <Users className="mb-1 h-6 w-6 text-rose-600" />
            <div className="text-foreground text-2xl font-bold">{summary.sections}</div>
            <div className="text-muted-foreground text-xs">Sections Linked</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onClose} className="px-8">
          Done & Refresh Academics
        </Button>
      </div>
    </div>
  );
}
