'use client';

import { useState, useMemo } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@student-erp/ui';
import { CheckCircle2, AlertTriangle, ArrowRight, Wand2 } from 'lucide-react';
import { ParsedAcademicData } from '../utils/csv-parser';
import {
  detectCodeConflicts,
  ConflictGroup,
  applyResolutionMappings,
} from '../utils/fuzzy-matcher';

interface Step2FuzzyCodeResolverProps {
  data: ParsedAcademicData;
  onResolved: (data: ParsedAcademicData) => void;
  onBack: () => void;
}

export function Step2FuzzyCodeResolver({ data, onResolved, onBack }: Step2FuzzyCodeResolverProps) {
  // Store resolutions: conflict.id -> selected replacement code
  const [resolutions, setResolutions] = useState<Record<string, string>>({});

  const conflicts = useMemo(() => detectCodeConflicts(data), [data]);

  const handleSelectSuggestion = (conflict: ConflictGroup, targetCode: string) => {
    setResolutions((prev) => ({
      ...prev,
      [conflict.unresolvedCode]: targetCode,
    }));
  };

  const handleAutoResolveHighConfidence = () => {
    const autoMap: Record<string, string> = { ...resolutions };
    conflicts.forEach((c) => {
      const topMatch = c.suggestions[0];
      if (topMatch && topMatch.score >= 70) {
        autoMap[c.unresolvedCode] = topMatch.value;
      }
    });
    setResolutions(autoMap);
  };

  const allResolved = conflicts.every((c) => Boolean(resolutions[c.unresolvedCode]));

  const handleProceed = () => {
    const updatedData = applyResolutionMappings(data, resolutions);
    onResolved(updatedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h3 className="text-lg font-semibold">2. Smart Referential Code Resolver</h3>
          <p className="text-muted-foreground text-sm">
            Resolve typos, missing department codes, or mismatched course keys without leaving the
            page.
          </p>
        </div>
        {conflicts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoResolveHighConfidence}
            className="text-primary hover:text-primary"
          >
            <Wand2 className="mr-2 h-4 w-4" /> Auto-Fix Matches (≥70%)
          </Button>
        )}
      </div>

      {conflicts.length === 0 ? (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-green-900">
              Perfect Relational Integrity!
            </h4>
            <p className="text-muted-foreground mt-1 max-w-md text-sm">
              All departments, programs, courses, and curriculum links are 100% matched with zero
              orphaned keys.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <span>
              Found <strong>{conflicts.length}</strong> unmatched reference(s). Choose the intended
              code or keep existing for each before proceeding.
            </span>
          </div>

          <div className="space-y-3">
            {conflicts.map((conflict) => {
              const selectedValue = resolutions[conflict.unresolvedCode];
              return (
                <Card key={conflict.id} className="border-border">
                  <CardHeader className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono uppercase">
                          {conflict.type}
                        </Badge>
                        <span className="text-sm font-semibold">
                          Unknown Code:{' '}
                          <span className="font-mono text-red-600">
                            "{conflict.unresolvedCode}"
                          </span>
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">{conflict.description}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pt-1 pb-4">
                    <div className="text-muted-foreground mb-2 text-xs">
                      Select replacement code:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {conflict.suggestions.map((sug) => {
                        const isSelected = selectedValue === sug.value;
                        return (
                          <button
                            key={sug.value}
                            type="button"
                            onClick={() => handleSelectSuggestion(conflict, sug.value)}
                            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                : 'border-border bg-card hover:bg-muted/50'
                            }`}
                          >
                            <span>
                              Map to <strong>{sug.value}</strong>
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-muted'
                              }`}
                            >
                              {sug.score}% Match
                            </Badge>
                          </button>
                        );
                      })}

                      {/* Fallback: Create or leave as-is button */}
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(conflict, conflict.unresolvedCode)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                          selectedValue === conflict.unresolvedCode
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-border hover:bg-muted/40 border-dashed'
                        }`}
                      >
                        Keep "{conflict.unresolvedCode}" (Add as New)
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={onBack}>
          ← Back to Upload
        </Button>
        <Button onClick={handleProceed} disabled={conflicts.length > 0 && !allResolved}>
          Next: Preview Progression & DAG →
        </Button>
      </div>
    </div>
  );
}
