'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@student-erp/ui';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  parseAcademicFiles,
  downloadStarterTemplates,
  ParsedAcademicData,
  ParseError,
  AcademicFileType,
} from '../utils/csv-parser';

interface Step1UploadFilesProps {
  onParsed: (data: ParsedAcademicData) => void;
}

export function Step1UploadFiles({ onParsed }: Step1UploadFilesProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [detectedMap, setDetectedMap] = useState<Record<string, AcademicFileType>>({});
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [parsedData, setParsedData] = useState<ParsedAcademicData | null>(null);

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setIsProcessing(true);
    setErrors([]);
    setSelectedFiles(files);

    try {
      const res = await parseAcademicFiles(files);
      setDetectedMap(res.detected);
      setErrors(res.errors);
      setParsedData(res.data);
    } catch (e: any) {
      setErrors([{ file: 'System', message: e.message || 'Failed to parse files.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const getBadgeColor = (type: AcademicFileType) => {
    switch (type) {
      case 'departments':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'courses':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'programs':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'curriculum':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'sections':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canProceed =
    parsedData &&
    errors.length === 0 &&
    (parsedData.departments.length > 0 ||
      parsedData.courses.length > 0 ||
      parsedData.programs.length > 0 ||
      parsedData.curriculums.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">1. Upload Academic Relational Files</h3>
          <p className="text-muted-foreground text-sm">
            Drag & drop up to 5 CSV/Excel files (Departments, Courses, Programs, Progression,
            Sections).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadStarterTemplates}>
          <Download className="mr-2 h-4 w-4" /> Download Starter Templates
        </Button>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-muted-foreground/30 hover:bg-muted/30'
        }`}
      >
        <div className="bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <Upload className="text-primary h-7 w-7" />
        </div>
        <h4 className="text-base font-semibold">Drag & drop CSV or Excel files here</h4>
        <p className="text-muted-foreground mt-1 text-sm">
          Supports .csv, .xlsx, .xls formatted according to 3NF standards
        </p>

        <label className="mt-5">
          <input
            type="file"
            multiple
            accept=".csv, .xlsx, .xls"
            onChange={onFileChange}
            className="hidden"
          />
          <Button variant="outline" type="button" className="pointer-events-none">
            Browse Local Files
          </Button>
        </label>
      </div>

      {/* Selected Files List & Detected Types */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Detected Files ({selectedFiles.length})</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {selectedFiles.map((f) => {
              const detected = detectedMap[f.name] || 'unknown';
              return (
                <div
                  key={f.name}
                  className="bg-card flex items-center justify-between rounded-lg border p-3 text-sm shadow-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileSpreadsheet className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="truncate font-medium">{f.name}</span>
                  </div>
                  <Badge className={getBadgeColor(detected)}>{detected.toUpperCase()}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Errors list */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span>Parsing Issues Detected ({errors.length})</span>
          </div>
          <ul className="list-inside list-disc space-y-1 text-xs">
            {errors.map((err, i) => (
              <li key={i}>
                <span className="font-semibold">{err.file}</span>
                {err.row ? ` (Row ${err.row})` : ''}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Parsed Summary Card */}
      {parsedData && errors.length === 0 && (
        <Card className="border-green-200 bg-green-50/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-base text-green-900">Entities Detected</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Files parsed successfully according to 3NF standards.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
              <div className="rounded-md border border-green-200 bg-white p-2">
                <div className="text-xl font-bold text-green-800">
                  {parsedData.departments.length}
                </div>
                <div className="text-muted-foreground text-xs">Departments</div>
              </div>
              <div className="rounded-md border border-green-200 bg-white p-2">
                <div className="text-xl font-bold text-green-800">{parsedData.courses.length}</div>
                <div className="text-muted-foreground text-xs">Courses</div>
              </div>
              <div className="rounded-md border border-green-200 bg-white p-2">
                <div className="text-xl font-bold text-green-800">{parsedData.programs.length}</div>
                <div className="text-muted-foreground text-xs">Programs</div>
              </div>
              <div className="rounded-md border border-green-200 bg-white p-2">
                <div className="text-xl font-bold text-green-800">
                  {parsedData.curriculums.reduce((acc, c) => acc + c.terms.length, 0)}
                </div>
                <div className="text-muted-foreground text-xs">Terms (DAG)</div>
              </div>
              <div className="rounded-md border border-green-200 bg-white p-2">
                <div className="text-xl font-bold text-green-800">
                  {parsedData.curriculums.reduce(
                    (acc, c) => acc + c.terms.reduce((tacc, t) => tacc + t.sections.length, 0),
                    0,
                  )}
                </div>
                <div className="text-muted-foreground text-xs">Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Actions */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={() => parsedData && onParsed(parsedData)}
          disabled={!canProceed || isProcessing}
        >
          {isProcessing ? 'Processing Files...' : 'Next: Check Code Integrity →'}
        </Button>
      </div>
    </div>
  );
}
