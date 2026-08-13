'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@student-erp/ui';
import { AdminApi } from '@student-erp/sdk';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold tracking-tight">
            Attendance Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Institution-wide attendance monitoring and session tracking.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:border-blue-800 dark:from-blue-950/20 dark:to-blue-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {sessions.length || 0}
            </div>
            <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400">Active this term</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/40">
          <CardTitle>Recent Attendance Sessions</CardTitle>
          <CardDescription>View and manage recent attendance logs.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-muted-foreground flex h-48 animate-pulse items-center justify-center">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-muted-foreground flex h-48 flex-col items-center justify-center">
              <p>No attendance sessions found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="hover:bg-muted/50 group flex items-center justify-between p-4 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold">
                      {session.course?.name || 'Unknown Course'} ({session.course?.code || 'N/A'})
                    </h4>
                    <div className="text-muted-foreground mt-1 flex items-center space-x-3 text-sm">
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>
                        {session.faculty?.user?.firstName} {session.faculty?.user?.lastName}
                      </span>
                      <span>•</span>
                      <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                        {session.section?.name || 'Main Section'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {session._count?.attendanceRecords || 0}
                      </div>
                      <div className="text-muted-foreground text-xs">Records</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
