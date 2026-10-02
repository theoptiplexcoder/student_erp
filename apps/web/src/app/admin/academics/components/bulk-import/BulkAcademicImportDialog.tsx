'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@student-erp/ui';
import { ParsedAcademicData } from './utils/csv-parser';
import { Step1UploadFiles } from './steps/Step1UploadFiles';
import { Step2FuzzyCodeResolver } from './steps/Step2FuzzyCodeResolver';
import { Step3ProgressionGraphView } from './steps/Step3ProgressionGraphView';
import { Step4ExecutionStatus } from './steps/Step4ExecutionStatus';
import { useIngestBulkImport, BulkIngestResponse } from '@/hooks/api/admin/useBulkAcademicImport';

interface BulkAcademicImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkAcademicImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: BulkAcademicImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [academicData, setAcademicData] = useState<ParsedAcademicData | null>(null);
  const [ingestResult, setIngestResult] = useState<BulkIngestResponse | null>(null);

  const ingestMutation = useIngestBulkImport();

  const handleReset = () => {
    setCurrentStep(1);
    setAcademicData(null);
    setIngestResult(null);
    ingestMutation.reset();
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(handleReset, 300);
  };

  const handleFilesParsed = (data: ParsedAcademicData) => {
    setAcademicData(data);
    setCurrentStep(2);
  };

  const handleConflictsResolved = (data: ParsedAcademicData) => {
    setAcademicData(data);
    setCurrentStep(3);
  };

  const handleExecuteIngest = async (academicYearCode: string) => {
    if (!academicData) return;

    const payload = {
      academicYearCode: academicYearCode || academicData.academicYearCode,
      departments: academicData.departments,
      courses: academicData.courses,
      programs: academicData.programs,
      curriculums: academicData.curriculums,
    };

    try {
      const res = await ingestMutation.mutateAsync(payload);
      setIngestResult(res);
      setCurrentStep(4);
      onSuccess();
    } catch (e) {
      setCurrentStep(4);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Bulk Academic Structure Ingestion</DialogTitle>
          </div>
          <DialogDescription>
            Normalized 3NF relational pipeline: Departments → Courses → Programs → Curriculum DAG →
            Sections
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b pb-3 text-xs font-medium">
          <div
            className={`flex items-center gap-1.5 ${
              currentStep === 1
                ? 'text-primary font-bold'
                : currentStep > 1
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                currentStep === 1
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              1
            </span>
            <span>Upload Files</span>
          </div>

          <span className="text-muted-foreground/30">→</span>

          <div
            className={`flex items-center gap-1.5 ${
              currentStep === 2
                ? 'text-primary font-bold'
                : currentStep > 2
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                currentStep === 2
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </span>
            <span>Resolve Codes</span>
          </div>

          <span className="text-muted-foreground/30">→</span>

          <div
            className={`flex items-center gap-1.5 ${
              currentStep === 3
                ? 'text-primary font-bold'
                : currentStep > 3
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                currentStep === 3
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              3
            </span>
            <span>Preview & Links</span>
          </div>

          <span className="text-muted-foreground/30">→</span>

          <div
            className={`flex items-center gap-1.5 ${
              currentStep === 4 ? 'text-primary font-bold' : 'text-muted-foreground/50'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                currentStep === 4
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              4
            </span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Step Views */}
        <div className="py-2">
          {currentStep === 1 && <Step1UploadFiles onParsed={handleFilesParsed} />}

          {currentStep === 2 && academicData && (
            <Step2FuzzyCodeResolver
              data={academicData}
              onResolved={handleConflictsResolved}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && academicData && (
            <Step3ProgressionGraphView
              data={academicData}
              onExecute={handleExecuteIngest}
              onBack={() => setCurrentStep(2)}
              isExecuting={ingestMutation.isPending}
            />
          )}

          {currentStep === 4 && (
            <Step4ExecutionStatus
              result={ingestResult}
              error={ingestMutation.error as Error | null}
              onClose={handleClose}
              onRetry={() => setCurrentStep(3)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
