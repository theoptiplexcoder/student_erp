'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  PageContainer,
  StatCard,
  EmptyState,
} from '@student-erp/ui';
import { AdminApi } from '@student-erp/sdk';
import { CheckCircle2, Users, AlertTriangle, GraduationCap } from 'lucide-react';
import { cn } from '@student-erp/utils';

interface SectionCard {
  sectionId: string;
  sectionName: string;
  sectionCode: string;
  program: string | null;
  classLevel: string | null;
  totalStudents: number;
  totalSessions: number;
  averageAttendancePercent: number;
  presentCount: number;
  totalRecords: number;
}

/** Colour-coded ring based on average attendance. */
function AttendanceRing({ value }: { value: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const filled = ((value / 100) * circumference).toFixed(1);

  const colour =
    value >= 85
      ? '#22c55e' // green-500
      : value >= 75
        ? '#f59e0b' // amber-500
        : '#ef4444'; // red-500

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
      {/* track */}
      <circle
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-muted/30"
      />
      {/* fill */}
      <circle
        cx="40"
        cy="40"
        r={radius}
        fill="none"
        stroke={colour}
        strokeWidth="6"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="700" fill={colour}>
        {value.toFixed(1)}%
      </text>
    </svg>
  );
}

function statusLabel(pct: number) {
  if (pct >= 85) return { text: 'Healthy', colour: 'text-green-600 bg-green-50' };
  if (pct >= 75) return { text: 'At Risk', colour: 'text-amber-600 bg-amber-50' };
  return { text: 'Critical', colour: 'text-red-600 bg-red-50' };
}

export default function AttendancePage() {
  const [sections, setSections] = useState<SectionCard[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [overviewRes, statsRes] = await Promise.all([
          AdminApi.attendance.getSectionOverview(),
          AdminApi.attendance.getStats(),
        ]);
        if (Array.isArray(overviewRes)) setSections(overviewRes);
        if (statsRes) setStats(statsRes);
      } catch (err) {
        console.error('Failed to load attendance overview', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derived KPIs from section data
  const totalSections = sections.length;
  const criticalSections = sections.filter((s) => s.averageAttendancePercent < 75).length;
  const overallAvg =
    sections.length > 0
      ? sections.reduce((sum, s) => sum + s.averageAttendancePercent, 0) / sections.length
      : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Attendance Overview"
        description="High-level average attendance per class section across the institution."
      />

      {/* KPI Ribbon */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Overall Avg Attendance"
          value={loading ? '...' : `${overallAvg.toFixed(1)}%`}
          icon={CheckCircle2}
          subtitle="Across all sections"
        />
        <StatCard
          label="Total Sections"
          value={loading ? '...' : totalSections}
          icon={Users}
          subtitle="Active class sections"
        />
        <StatCard
          label="Critical Sections"
          value={loading ? '...' : criticalSections}
          icon={AlertTriangle}
          subtitle="Below 75% attendance"
        />
      </div>

      {/* Section Cards Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/60 animate-pulse">
              <CardContent className="h-36" />
            </Card>
          ))}
        </div>
      ) : sections.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No sections found"
          description="Create sections and record attendance sessions for them to appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sections.map((section) => {
            const badge = statusLabel(section.averageAttendancePercent);
            return (
              <Card
                key={section.sectionId}
                className="border-border/60 shadow-xs transition-shadow hover:shadow-sm"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm leading-tight font-semibold">
                        {section.classLevel
                          ? `${section.classLevel} — ${section.sectionName}`
                          : section.sectionName}
                      </CardTitle>
                      <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                        {section.program ?? 'No program'}
                        {' · '}
                        <span className="font-mono">{section.sectionCode}</span>
                      </p>
                    </div>
                    {/* Status pill */}
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        badge.colour,
                      )}
                    >
                      {badge.text}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-4">
                    {/* Circular progress */}
                    <AttendanceRing value={section.averageAttendancePercent} />

                    {/* Stats */}
                    <div className="flex min-w-0 flex-col gap-1.5 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Students</span>
                        <span className="font-semibold tabular-nums">{section.totalStudents}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Sessions</span>
                        <span className="font-semibold tabular-nums">{section.totalSessions}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Present</span>
                        <span className="font-semibold text-green-600 tabular-nums">
                          {section.presentCount}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Total Records</span>
                        <span className="font-semibold tabular-nums">{section.totalRecords}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
