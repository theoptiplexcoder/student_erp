import React from 'react';
import { Button } from '@student-erp/ui';
import { Download, Upload, Zap, Loader2 } from 'lucide-react';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';
import { useAdminSections } from '@/hooks/api/admin/useSections';

interface TimetableToolbarProps {
  onGenerate: () => void;
  isGenerating?: boolean;
  onImport: () => void;
  onExport: () => void;
  onPublish: () => void;
  programId?: string;
  setProgramId?: (val: string) => void;
  termId: string;
  setTermId: (val: string) => void;
  sectionId: string;
  setSectionId: (val: string) => void;
  facultyId?: string;
  setFacultyId?: (val: string) => void;
  dayOfWeek?: string;
  setDayOfWeek?: (val: string) => void;
  status?: string;
  isPublishing?: boolean;
}

export function TimetableToolbar({
  onGenerate,
  onImport,
  onExport,
  onPublish,
  programId,
  setProgramId,
  termId,
  setTermId,
  sectionId,
  setSectionId,
  facultyId,
  setFacultyId,
  dayOfWeek,
  setDayOfWeek,
  isGenerating,
  status,
  isPublishing,
}: TimetableToolbarProps) {
  const { data: programsResponse, isLoading: isLoadingPrograms } = useAdminPrograms(1, 100);
  const { data: terms, isLoading: isLoadingTerms } = useAdminTerms();
  const { data: sectionsResponse, isLoading: isLoadingSections } = useAdminSections(1, 100);

  const programs = programsResponse?.data || [];
  const allSections = sectionsResponse?.data || [];

  // 1. Filter sections by program if selected
  const programSections = programId
    ? allSections.filter((s: any) => s.programId === programId || s.program?.id === programId)
    : allSections;

  // 2. Filter sections relevant to selected term if term is also chosen
  const selectedTerm = terms?.find((t: any) => t.id === termId);
  const sections = selectedTerm
    ? programSections.filter(
        (s: any) =>
          (s.semester === undefined ||
            s.semester === null ||
            s.semester === selectedTerm.semester) &&
          (!selectedTerm.academicYearId || s.academicYearId === selectedTerm.academicYearId),
      )
    : programSections;

  const noSectionsAvailable = sections.length === 0 && !isLoadingSections;

  return (
    <div className="bg-card mb-6 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 shadow-sm md:flex-row md:items-center">
      <div className="flex w-full flex-wrap gap-2 md:w-auto">
        {/* 1. Program Selector */}
        {setProgramId && (
          <select
            value={programId || ''}
            onChange={(e) => {
              setProgramId(e.target.value);
              setSectionId('');
            }}
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm md:w-[190px]"
            disabled={isLoadingPrograms}
          >
            <option value="">All Programs</option>
            {programs.map((prog: any) => (
              <option key={prog.id} value={prog.id}>
                {prog.name} {prog.code ? `(${prog.code})` : ''}
              </option>
            ))}
          </select>
        )}

        {/* 2. Term Selector */}
        <select
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm md:w-[180px]"
          disabled={isLoadingTerms}
        >
          <option value="">Select Term *</option>
          {terms?.map((term: any) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>

        {/* 3. Section Selector */}
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm md:w-[180px]"
          disabled={isLoadingSections || noSectionsAvailable}
        >
          <option value="">{noSectionsAvailable ? 'No sections available' : 'All Sections'}</option>
          {sections.map((section: any) => (
            <option key={section.id} value={section.id}>
              {section.name} {section.code ? `(${section.code})` : ''}
            </option>
          ))}
        </select>

        {/* 4. Day Selector (optional) */}
        {setDayOfWeek && (
          <select
            value={dayOfWeek || ''}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm md:w-[150px]"
          >
            <option value="">All Days</option>
            <option value="MONDAY">Monday</option>
            <option value="TUESDAY">Tuesday</option>
            <option value="WEDNESDAY">Wednesday</option>
            <option value="THURSDAY">Thursday</option>
            <option value="FRIDAY">Friday</option>
            <option value="SATURDAY">Saturday</option>
          </select>
        )}
      </div>

      <div className="flex w-full flex-wrap gap-2 md:w-auto">
        <Button
          onClick={onGenerate}
          variant="outline"
          className="gap-2 text-xs sm:text-sm"
          disabled={isGenerating || !termId}
          title={!termId ? 'Please select a term before generating' : 'Generate weekly timetable'}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Generate
        </Button>
        <Button onClick={onImport} variant="outline" className="gap-2 text-xs sm:text-sm">
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button
          onClick={onExport}
          variant="outline"
          className="gap-2 text-xs sm:text-sm"
          disabled={!termId || status === 'NO_TIMETABLE'}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button
          onClick={onPublish}
          className="gap-2 text-xs sm:text-sm"
          disabled={isPublishing || !termId || status === 'NO_TIMETABLE'}
        >
          {isPublishing ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}
