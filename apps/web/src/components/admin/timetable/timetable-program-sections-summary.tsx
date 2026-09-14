'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@student-erp/ui';
import { ChevronDown, ChevronUp, Users, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import { Section } from '@/hooks/api/admin/useSections';

interface TimetableProgramSectionsSummaryProps {
  programName?: string;
  sections: Section[];
  isLoading?: boolean;
}

export function TimetableProgramSectionsSummary({
  programName,
  sections,
  isLoading,
}: TimetableProgramSectionsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!programName) return null;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="cursor-pointer py-3" onClick={() => setIsExpanded((prev) => !prev)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary h-5 w-5" />
            <CardTitle className="text-base font-semibold">
              {programName} — Sections, Courses & Faculty
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {sections.length} Section{sections.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground rounded p-1"
            aria-label={isExpanded ? 'Collapse section overview' : 'Expand section overview'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-4">
          {isLoading ? (
            <div className="text-muted-foreground py-4 text-center text-sm">
              Loading sections and assignments...
            </div>
          ) : sections.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-sm">
              <AlertCircle className="h-4 w-4" />
              No sections found for this program. You can create sections in the Academics tab.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => {
                const assignments = section.courseAssignments || [];
                const offerings = section.courseOfferings || [];

                return (
                  <div
                    key={section.id}
                    className="border-border bg-muted/20 flex flex-col justify-between rounded-lg border p-3.5 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-sm font-semibold">
                          {section.name} {section.code ? `(${section.code})` : ''}
                        </span>
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Users className="h-3 w-3" />
                          <span>Capacity: {section.capacity || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 space-y-2">
                        {assignments.length > 0 ? (
                          assignments.map((asg) => (
                            <div
                              key={asg.id}
                              className="bg-background flex flex-col rounded border p-2 text-xs"
                            >
                              <div className="flex items-center justify-between font-medium">
                                <span className="truncate" title={asg.course?.name}>
                                  {asg.course?.name}
                                </span>
                                {asg.course?.code && (
                                  <Badge
                                    variant="outline"
                                    className="px-1 py-0 font-mono text-[10px]"
                                  >
                                    {asg.course.code}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]">
                                <Users className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {asg.faculty?.user
                                    ? `${asg.faculty.user.firstName} ${asg.faculty.user.lastName}`
                                    : 'Faculty TBA'}
                                  {asg.faculty?.teacherCode ? ` (${asg.faculty.teacherCode})` : ''}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : offerings.length > 0 ? (
                          offerings.map((off) => (
                            <div
                              key={off.id}
                              className="bg-background flex flex-col rounded border p-2 text-xs"
                            >
                              <div className="flex items-center justify-between font-medium">
                                <span className="truncate" title={off.course?.name}>
                                  {off.course?.name}
                                </span>
                                {off.course?.code && (
                                  <Badge
                                    variant="outline"
                                    className="px-1 py-0 font-mono text-[10px]"
                                  >
                                    {off.course.code}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]">
                                <BookOpen className="h-3 w-3 shrink-0" />
                                <span>Credits: {off.course?.creditValue ?? 3}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground bg-background rounded border border-dashed p-3 text-center text-xs">
                            No courses directly mapped to this section yet.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-muted-foreground mt-3 flex items-center justify-between border-t pt-2 text-[11px]">
                      <span>
                        {assignments.length > 0
                          ? `${assignments.length} Course${assignments.length !== 1 ? 's' : ''} assigned`
                          : offerings.length > 0
                            ? `${offerings.length} Course${offerings.length !== 1 ? 's' : ''} offered`
                            : 'Ready for timetable'}
                      </span>
                      {section.semester && <span>Sem {section.semester}</span>}
                    </div>
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
