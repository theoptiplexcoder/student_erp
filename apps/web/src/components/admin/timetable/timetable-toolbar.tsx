import React from 'react';
import { Button } from '@student-erp/ui';
import { Download, Upload, Zap, Send, Loader2 } from 'lucide-react';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminFaculty } from '@/hooks/api/admin/useFaculty';

interface TimetableToolbarProps {
  onGenerate: () => void;
  isGenerating?: boolean;
  onImport: () => void;
  onExport: () => void;
  onPublish: () => void;
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
  const { data: terms, isLoading: isLoadingTerms } = useAdminTerms();
  const { data: sectionsResponse, isLoading: isLoadingSections } = useAdminSections(1, 100);
  const { data: facultyResponse, isLoading: isLoadingFaculty } = useAdminFaculty(1, 100);

  const allSections = sectionsResponse?.data || [];
  const faculties = facultyResponse?.data || [];

  // Filter sections relevant to selected term
  const selectedTerm = terms?.find((t: any) => t.id === termId);
  const sections = selectedTerm
    ? allSections.filter(
        (s: any) =>
          s.semester === selectedTerm.semester && s.academicYearId === selectedTerm.academicYearId,
      )
    : allSections;
  const noSectionsForTerm = !!termId && sections.length === 0 && !isLoadingSections;

  return (
    <div className="bg-card mb-6 flex flex-col items-start justify-between gap-4 rounded-lg border p-4 shadow-sm md:flex-row md:items-center">
      <div className="flex w-full flex-wrap gap-2 md:w-auto">
        <select
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm md:w-[180px]"
          disabled={isLoadingTerms}
        >
          <option value="">Select Term</option>
          {terms?.map((term: any) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>

        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm md:w-[180px]"
          disabled={isLoadingSections || noSectionsForTerm}
        >
          <option value="">
            {noSectionsForTerm ? 'No sections for this term' : 'All Sections'}
          </option>
          {sections.map((section: any) => (
            <option key={section.id} value={section.id}>
              {section.name} {section.code ? `(${section.code})` : ''}
            </option>
          ))}
        </select>

        {setFacultyId && (
          <select
            value={facultyId || ''}
            onChange={(e) => setFacultyId(e.target.value)}
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm md:w-[180px]"
            disabled={isLoadingFaculty}
          >
            <option value="">All Faculty</option>
            {faculties.map((faculty: any) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.user.firstName} {faculty.user.lastName} ({faculty.teacherCode})
              </option>
            ))}
          </select>
        )}

        {setDayOfWeek && (
          <select
            value={dayOfWeek || ''}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm md:w-[180px]"
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

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onGenerate}
          variant="outline"
          className="gap-2"
          disabled={isGenerating || !termId}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Generate
        </Button>
        <Button onClick={onImport} variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button
          onClick={onExport}
          variant="outline"
          className="gap-2"
          disabled={!termId || status === 'NO_TIMETABLE'}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        {status === 'DRAFT' && (
          <Button onClick={onPublish} className="gap-2" disabled={isPublishing}>
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publish
          </Button>
        )}
      </div>
    </div>
  );
}
