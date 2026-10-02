'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Input,
  Label,
} from '@student-erp/ui';
import {
  ArrowRight,
  BookOpen,
  Users,
  AlertTriangle,
  GitBranch,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { ParsedAcademicData } from '../utils/csv-parser';

interface Step3ProgressionGraphViewProps {
  data: ParsedAcademicData;
  onExecute: (academicYearCode: string) => void;
  onBack: () => void;
  isExecuting: boolean;
}

export function Step3ProgressionGraphView({
  data,
  onExecute,
  onBack,
  isExecuting,
}: Step3ProgressionGraphViewProps) {
  const [academicYearCode, setAcademicYearCode] = useState(data.academicYearCode || 'AY-2026-27');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">3. Curriculum Progression & Section Lineage</h3>
          <p className="text-muted-foreground text-sm">
            Review the directional progression graph. Sections are linked directly to terms for
            seamless cohort promotion.
          </p>
        </div>
      </div>

      {/* Target Academic Year Input */}
      <div className="bg-muted/30 flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary h-5 w-5" />
          <Label htmlFor="ayCode" className="text-sm font-semibold">
            Target Academic Year Code:
          </Label>
        </div>
        <div className="w-48">
          <Input
            id="ayCode"
            placeholder="e.g. AY-2026-27"
            value={academicYearCode}
            onChange={(e) => setAcademicYearCode(e.target.value)}
          />
        </div>
        <span className="text-muted-foreground text-xs">
          Sections will be registered under this academic session.
        </span>
      </div>

      {/* Progression Graphs per Program */}
      <div className="space-y-6">
        {data.curriculums.map((curr, cIdx) => {
          const prog = data.programs.find((p) => p.code === curr.programCode);
          return (
            <Card key={cIdx} className="border-border shadow-xs">
              <CardHeader className="bg-muted/10 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GitBranch className="text-primary h-5 w-5" />
                      <span>{prog ? prog.name : curr.programCode}</span>
                      <Badge variant="outline" className="font-mono">
                        {curr.programCode}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Curriculum Scheme: <strong>{curr.curriculumName}</strong>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {curr.terms.length} Terms Directed Graph
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Horizontal Progression Chain */}
                <div className="flex flex-col gap-4 overflow-x-auto pb-2">
                  <div className="flex min-w-max items-start gap-3">
                    {curr.terms.map((term, tIdx) => {
                      const totalCapacity = term.sections.reduce((acc, s) => acc + s.capacity, 0);
                      const nextTerm = curr.terms[tIdx + 1];
                      const nextCapacity = nextTerm
                        ? nextTerm.sections.reduce((acc, s) => acc + s.capacity, 0)
                        : null;
                      const hasCapacityMismatch =
                        nextCapacity !== null &&
                        term.sections.length > 0 &&
                        nextTerm.sections.length > 0 &&
                        totalCapacity > nextCapacity;

                      return (
                        <div key={term.sequence} className="flex items-center gap-3">
                          {/* Term Card */}
                          <div className="bg-card w-64 rounded-lg border p-3 shadow-xs">
                            <div className="flex items-center justify-between border-b pb-2">
                              <span className="text-primary text-xs font-semibold">
                                {term.name || `Term ${term.sequence}`}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                Seq {term.sequence}
                              </Badge>
                            </div>

                            {/* Courses List */}
                            <div className="mt-2 space-y-1">
                              <div className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
                                <BookOpen className="h-3 w-3" /> Courses ({term.courses.length})
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {term.courses.map((tc) => (
                                  <span
                                    key={tc.courseCode}
                                    title={
                                      tc.prerequisites?.length
                                        ? `Requires: ${tc.prerequisites.join(', ')}`
                                        : undefined
                                    }
                                    className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                                      tc.prerequisites?.length
                                        ? 'border-amber-200 bg-amber-50 text-amber-900'
                                        : 'bg-muted text-muted-foreground border-border'
                                    }`}
                                  >
                                    {tc.courseCode}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Pre-linked Sections for Cohort Promotion */}
                            <div className="mt-3 space-y-1 border-t pt-2">
                              <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" /> Sections ({term.sections.length})
                                </span>
                                <span className="text-[10px]">Cap: {totalCapacity}</span>
                              </div>
                              {term.sections.length === 0 ? (
                                <span className="text-muted-foreground text-[10px] italic">
                                  No sections defined
                                </span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {term.sections.map((s) => (
                                    <span
                                      key={s.code}
                                      className="bg-primary/10 text-primary border-primary/20 rounded border px-1.5 py-0.5 font-mono text-[10px]"
                                    >
                                      Sec {s.code} ({s.capacity})
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Capacity Bottleneck Warning */}
                            {hasCapacityMismatch && (
                              <div className="mt-2 flex items-center gap-1 rounded bg-amber-50 p-1 text-[10px] text-amber-800">
                                <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />
                                <span>
                                  Seats shrink from {totalCapacity} → {nextCapacity}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Progression Flow Arrow */}
                          {tIdx < curr.terms.length - 1 && (
                            <div className="text-muted-foreground flex flex-col items-center justify-center">
                              <ArrowRight className="h-5 w-5" />
                              <span className="text-[9px] font-semibold tracking-wider uppercase">
                                Promotes
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirmation & Stats Bar */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={onBack} disabled={isExecuting}>
          ← Back to Code Resolver
        </Button>
        <Button
          onClick={() => onExecute(academicYearCode)}
          disabled={isExecuting || !academicYearCode.trim()}
          className="bg-primary text-primary-foreground shadow-sm"
        >
          {isExecuting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Ingesting Academic Structure...
            </span>
          ) : (
            'Confirm & Ingest Structure (3NF) →'
          )}
        </Button>
      </div>
    </div>
  );
}
