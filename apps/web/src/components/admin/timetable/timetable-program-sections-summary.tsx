'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@student-erp/ui';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  User,
  Users,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Section } from '@/hooks/api/admin/useSections';

interface TimetableProgramSectionsSummaryProps {
  programName?: string;
  programCode?: string;
  sections: Section[];
  isLoading?: boolean;
  selectedSectionId?: string;
  onSelectSection?: (sectionId: string) => void;
  onGenerateClick?: () => void;
  isGenerating?: boolean;
  hasTermSelected?: boolean;
}

export function TimetableProgramSectionsSummary({
  programName,
  programCode,
  sections,
  isLoading,
  selectedSectionId,
  onSelectSection,
  onGenerateClick,
  isGenerating,
  hasTermSelected,
}: TimetableProgramSectionsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!programName && !selectedSectionId && (!sections || sections.length === 0)) {
    return null;
  }

  // Count total courses and assigned faculties across sections
  let totalAssignments = 0;
  let sectionsWithAssignments = 0;

  for (const sec of sections) {
    const assignmentsCount = sec.courseAssignments?.length || 0;
    if (assignmentsCount > 0) {
      totalAssignments += assignmentsCount;
      sectionsWithAssignments++;
    }
  }

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <Card className="border-border bg-card shadow-sm transition-all">
      <CardHeader className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base font-semibold sm:text-lg">
                  {selectedSection
                    ? `Section ${selectedSection.name}`
                    : programName || 'Academic Sections Overview'}
                </CardTitle>
                {selectedSection?.code ? (
                  <Badge variant="outline" className="text-xs">
                    {selectedSection.code}
                  </Badge>
                ) : programCode ? (
                  <Badge variant="outline" className="text-xs">
                    {programCode}
                  </Badge>
                ) : null}
                {selectedSection && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedSection.program?.name || programName || 'Program'}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                {selectedSection ? (
                  <>
                    {selectedSection.courseAssignments?.length || 0} Assigned Course
                    {(selectedSection.courseAssignments?.length || 0) !== 1 ? 's' : ''} &bull;{' '}
                    {selectedSection._count?.students ?? 0} Enrolled Student
                    {(selectedSection._count?.students ?? 0) !== 1 ? 's' : ''}
                    {selectedSection.capacity ? ` / ${selectedSection.capacity} Max Capacity` : ''}
                  </>
                ) : (
                  <>
                    {sections.length} Section{sections.length !== 1 ? 's' : ''} &bull;{' '}
                    {totalAssignments} Course-Faculty Assignment{totalAssignments !== 1 ? 's' : ''}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onGenerateClick && (
              <Button
                size="sm"
                onClick={onGenerateClick}
                disabled={isGenerating || !hasTermSelected || sections.length === 0}
                className="gap-2 text-xs sm:text-sm"
              >
                {isGenerating ? 'Generating...' : 'Generate Timetable'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1 text-xs"
              aria-label={isExpanded ? 'Collapse sections' : 'Expand sections'}
            >
              {isExpanded ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Show Details</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-border border-t p-4 sm:p-5">
          {isLoading ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              Loading program sections and faculties...
            </div>
          ) : sections.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              No sections found for this program. Create sections and assign courses under
              Academics.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => {
                const assignments = section.courseAssignments || [];
                const isSelected = selectedSectionId === section.id;

                return (
                  <div
                    key={section.id}
                    onClick={() => onSelectSection && onSelectSection(isSelected ? '' : section.id)}
                    className={`bg-background relative flex flex-col justify-between rounded-lg border p-3.5 transition-all sm:p-4 ${
                      isSelected
                        ? 'border-primary ring-primary/20 ring-2'
                        : 'border-border hover:border-muted-foreground/40'
                    } ${onSelectSection ? 'cursor-pointer' : ''}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold sm:text-base">{section.name}</h4>
                            {section.code && (
                              <span className="text-muted-foreground text-xs">
                                ({section.code})
                              </span>
                            )}
                          </div>
                          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                            {section.program?.name && (
                              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                                {section.program.code || section.program.name}
                              </Badge>
                            )}
                            {section.semester && <span>Sem {section.semester}</span>}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {section._count?.students ?? 0}
                              {section.capacity ? ` / ${section.capacity}` : ''} students
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <Badge variant="default" className="text-[10px]">
                            Viewing
                          </Badge>
                        )}
                      </div>

                      {/* Courses and Assigned Faculty */}
                      <div className="mt-3 space-y-2 border-t pt-2.5">
                        <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            Courses &amp; Faculty
                          </span>
                          <span>{assignments.length} assigned</span>
                        </div>

                        {assignments.length === 0 ? (
                          <div className="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-md p-2 text-xs">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>No faculty assigned yet for this section</span>
                          </div>
                        ) : (
                          <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                            {assignments.map((assignment) => {
                              const facultyName = assignment.faculty?.user
                                ? `${assignment.faculty.user.firstName} ${assignment.faculty.user.lastName}`
                                : 'Assigned Faculty';

                              return (
                                <li
                                  key={assignment.id}
                                  className="bg-muted/40 flex flex-col justify-between gap-1 rounded-md p-2 text-xs"
                                >
                                  <div className="flex items-center justify-between font-medium">
                                    <span className="line-clamp-1">{assignment.course.name}</span>
                                    {assignment.course.code && (
                                      <span className="text-muted-foreground ml-2 shrink-0 text-[10px]">
                                        {assignment.course.code}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                                    <User className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{facultyName}</span>
                                    {assignment.faculty?.teacherCode && (
                                      <span className="opacity-75">
                                        ({assignment.faculty.teacherCode})
                                      </span>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>

                    {onSelectSection && (
                      <div className="mt-3 pt-2 text-right">
                        <span className="text-primary text-xs font-medium hover:underline">
                          {isSelected ? 'View all sections' : 'Filter timetable to this section →'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
