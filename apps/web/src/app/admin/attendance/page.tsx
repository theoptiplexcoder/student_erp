'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  PageContainer,
  StatCard,
  EmptyState,
  StatusBadge,
} from '@student-erp/ui';
import { AdminApi } from '@student-erp/sdk';
import { ClipboardList, Users, CheckCircle2, Calendar, Clock } from 'lucide-react';

export default function AttendancePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await AdminApi.attendance.getSessions();
        if (res && res.data) {
          setSessions(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch attendance sessions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Attendance Monitor"
        description="Institution-wide attendance tracking, lecture session logs, and real-time absence monitoring."
      />

      {/* KPI Ribbons */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Logged Sessions"
          value={loading ? '...' : sessions.length.toLocaleString()}
          icon={ClipboardList}
          subtitle="Recorded in current academic cycle"
        />
        <StatCard
          label="Average Attendance"
          value="92.4%"
          icon={CheckCircle2}
          trend={{ value: '+1.2%', direction: 'up', label: 'vs last week' }}
        />
        <StatCard
          label="Absence Flag Threshold"
          value="75.0%"
          icon={Users}
          subtitle="Mandatory minimum compliance"
        />
      </div>

      {/* Session Data Records */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-border/60 border-b p-4 sm:p-5">
          <CardTitle className="text-sm font-semibold">Recent Class Sessions</CardTitle>
          <CardDescription className="text-xs">
            Real-time attendance logs submitted by teaching faculty.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-muted-foreground flex h-44 animate-pulse items-center justify-center text-xs">
              Loading sessions data...
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No attendance sessions logged today"
              description="Sessions conducted by faculty members will appear here automatically."
            />
          ) : (
            <div className="divide-border/60 divide-y">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="hover:bg-muted/40 group flex flex-col justify-between gap-3 p-3.5 transition-colors sm:flex-row sm:items-center sm:p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-foreground text-xs font-semibold">
                        {session.course?.name || 'Academic Course'}
                      </h4>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        ({session.course?.code || 'N/A'})
                      </span>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>
                        Faculty: {session.faculty?.user?.firstName}{' '}
                        {session.faculty?.user?.lastName}
                      </span>
                      <span>•</span>
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
                        Section {session.section?.name || 'A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-foreground text-xs font-semibold">
                        {session._count?.attendanceRecords || 0} Students
                      </div>
                      <div className="text-muted-foreground text-[10px]">Verified</div>
                    </div>
                    <StatusBadge status="completed" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
