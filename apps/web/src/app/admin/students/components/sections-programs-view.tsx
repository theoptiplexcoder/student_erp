'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  Skeleton,
} from '@student-erp/ui';
import {
  GraduationCap,
  Users,
  Search,
  Plus,
  Upload,
  UserPlus,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAdminPrograms, Program } from '@/hooks/api/admin/usePrograms';
import { useAdminSections, Section } from '@/hooks/api/admin/useSections';
import { QuickAdmissionModal } from './quick-admission-modal';
import { BulkUploadModal } from './bulk-upload-modal';

export function SectionsProgramsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');

  // Modals state
  const [admissionTarget, setAdmissionTarget] = useState<{
    programId?: string;
    programName?: string;
    sectionId?: string;
    sectionName?: string;
  } | null>(null);
  const [bulkUploadTarget, setBulkUploadTarget] = useState<{
    programId?: string;
    programName?: string;
    sectionId?: string;
    sectionName?: string;
  } | null>(null);

  // Queries
  const { data: programsData, isLoading: isLoadingPrograms } = useAdminPrograms(1, 100);
  const { data: sectionsData, isLoading: isLoadingSections } = useAdminSections(1, 500);

  const programs = programsData?.data || [];
  const sections = sectionsData?.data || [];

  // Group sections under their programs
  const groupedData = useMemo(() => {
    return programs.map((prog) => {
      const progSections = sections.filter((sec) => sec.program?.id === prog.id);
      const totalStudents = progSections.reduce((sum, s) => sum + (s._count?.students || 0), 0);
      const totalCapacity = progSections.reduce((sum, s) => sum + (s.capacity || 0), 0);

      return {
        program: prog,
        sections: progSections,
        totalStudents,
        totalCapacity,
      };
    });
  }, [programs, sections]);

  // Handle unassigned sections if any
  const unassignedSections = useMemo(() => {
    return sections.filter((s) => !s.program?.id);
  }, [sections]);

  // Filter based on search & program dropdown
  const filteredGroups = useMemo(() => {
    return groupedData
      .filter((group) => {
        if (selectedProgramId !== 'all' && group.program.id !== selectedProgramId) {
          return false;
        }
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const matchesProgram =
          group.program.name.toLowerCase().includes(q) ||
          group.program.code.toLowerCase().includes(q);
        const matchesSection = group.sections.some(
          (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
        );
        return matchesProgram || matchesSection;
      })
      .map((group) => {
        if (!searchQuery) return group;
        const q = searchQuery.toLowerCase();
        // If program matched, keep all sections, else filter matching sections
        const matchesProgram =
          group.program.name.toLowerCase().includes(q) ||
          group.program.code.toLowerCase().includes(q);
        if (matchesProgram) return group;
        return {
          ...group,
          sections: group.sections.filter(
            (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
          ),
        };
      });
  }, [groupedData, selectedProgramId, searchQuery]);

  const isLoading = isLoadingPrograms || isLoadingSections;

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search programs or sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="border-input bg-background focus:ring-primary flex h-9 rounded-md border px-3 py-1 text-xs focus:ring-1 focus:outline-none"
          >
            <option value="all">All Programs ({programs.length})</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-border/80 space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-40 rounded-xl" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="border-border/80 p-12 text-center">
          <div className="bg-muted text-muted-foreground mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">No sections or programs found</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'Create academic programs and sections to start organizing students.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map(
            ({ program, sections: progSections, totalStudents, totalCapacity }) => (
              <Card key={program.id} className="border-border/80 overflow-hidden shadow-xs">
                {/* Program Header */}
                <div className="border-border/70 bg-muted/30 flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-foreground text-base font-semibold">{program.name}</h2>
                        <Badge variant="outline" className="font-mono text-xs">
                          {program.code}
                        </Badge>
                        <Badge variant="secondary" className="text-[11px]">
                          {program.level}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                        <span>
                          {progSections.length} {progSections.length === 1 ? 'Section' : 'Sections'}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-foreground">{totalStudents}</strong> students
                          enrolled
                        </span>
                        {totalCapacity > 0 && (
                          <>
                            <span>•</span>
                            <span>Total Capacity: {totalCapacity}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setBulkUploadTarget({
                          programId: program.id,
                          programName: program.name,
                        })
                      }
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Bulk Upload
                    </Button>
                  </div>
                </div>

                {/* Sections Grid */}
                <CardContent className="p-5">
                  {progSections.length === 0 ? (
                    <div className="border-border/80 rounded-lg border border-dashed p-8 text-center">
                      <p className="text-muted-foreground text-xs">
                        No sections configured for this program yet.
                      </p>
                      <Link href={`/admin/academics/sections`} className="mt-2 inline-block">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="mr-1.5 h-3 w-3" /> Create Section
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {progSections.map((sec) => {
                        const count = sec._count?.students || 0;
                        const capacity = sec.capacity || 0;
                        const fillPercent =
                          capacity > 0 ? Math.min(100, Math.round((count / capacity) * 100)) : 0;
                        const isFull = capacity > 0 && count >= capacity;

                        return (
                          <div
                            key={sec.id}
                            className="group border-border/80 bg-card hover:border-primary/50 relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-xs"
                          >
                            <div>
                              {/* Card Top */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-foreground group-hover:text-primary text-sm font-semibold transition-colors">
                                      {sec.name}
                                    </h3>
                                    <span className="text-muted-foreground font-mono text-[11px]">
                                      ({sec.code})
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground mt-0.5 text-[11px]">
                                    {sec.semester ? `Semester ${sec.semester}` : 'Regular Session'}
                                  </div>
                                </div>

                                <Badge
                                  variant={
                                    isFull ? 'destructive' : count > 0 ? 'default' : 'secondary'
                                  }
                                  className="px-1.5 py-0 text-[10px]"
                                >
                                  {count} Students
                                </Badge>
                              </div>

                              {/* Capacity Bar */}
                              <div className="mt-3.5 space-y-1.5">
                                <div className="text-muted-foreground flex justify-between text-[11px]">
                                  <span>Roster Capacity</span>
                                  <span className="text-foreground font-medium">
                                    {count} / {capacity || '∞'}
                                  </span>
                                </div>
                                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isFull
                                        ? 'bg-destructive'
                                        : fillPercent > 80
                                          ? 'bg-amber-500'
                                          : 'bg-primary'
                                    }`}
                                    style={{ width: `${capacity > 0 ? fillPercent : 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="border-border/60 mt-4 flex items-center justify-between gap-2 border-t pt-3">
                              <Link href={`/admin/students/sections/${sec.id}`} className="flex-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-full gap-1 text-xs"
                                >
                                  <Users className="h-3 w-3" />
                                  View Students
                                </Button>
                              </Link>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setBulkUploadTarget({
                                      programId: program.id,
                                      programName: program.name,
                                      sectionId: sec.id,
                                      sectionName: sec.name,
                                    })
                                  }
                                  title="Bulk Upload Students to this section"
                                  className="text-muted-foreground hover:text-foreground h-7 w-7"
                                >
                                  <Upload className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setAdmissionTarget({
                                      programId: program.id,
                                      programName: program.name,
                                      sectionId: sec.id,
                                      sectionName: sec.name,
                                    })
                                  }
                                  title="Direct Student Admission into this section"
                                  className="text-primary hover:bg-primary/10 h-7 w-7"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ),
          )}

          {/* Unassigned sections if any */}
          {unassignedSections.length > 0 && (
            <Card className="border-border/80 overflow-hidden shadow-xs">
              <div className="border-border/70 bg-muted/20 border-b px-5 py-3">
                <h3 className="text-foreground text-sm font-semibold">
                  Other / Unassigned Sections ({unassignedSections.length})
                </h3>
              </div>
              <CardContent className="p-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {unassignedSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="border-border/80 bg-card flex flex-col justify-between rounded-xl border p-4"
                    >
                      <div>
                        <h4 className="text-sm font-semibold">{sec.name}</h4>
                        <p className="text-muted-foreground font-mono text-xs">{sec.code}</p>
                      </div>
                      <div className="border-border/60 mt-4 flex items-center justify-between border-t pt-3">
                        <Link href={`/admin/students/sections/${sec.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="h-7 w-full gap-1 text-xs">
                            <Users className="h-3 w-3" />
                            View Students ({sec._count?.students || 0})
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Direct Admission Modal */}
      {admissionTarget && (
        <QuickAdmissionModal
          isOpen={!!admissionTarget}
          onClose={() => setAdmissionTarget(null)}
          programId={admissionTarget.programId}
          programName={admissionTarget.programName}
          sectionId={admissionTarget.sectionId}
          sectionName={admissionTarget.sectionName}
        />
      )}

      {/* Bulk Upload Modal */}
      {bulkUploadTarget && (
        <BulkUploadModal
          isOpen={!!bulkUploadTarget}
          onClose={() => setBulkUploadTarget(null)}
          programId={bulkUploadTarget.programId}
          programName={bulkUploadTarget.programName}
          sectionId={bulkUploadTarget.sectionId}
          sectionName={bulkUploadTarget.sectionName}
        />
      )}
    </div>
  );
}
