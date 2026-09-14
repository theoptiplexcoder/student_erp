'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@student-erp/ui';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  FileCheck,
  Search,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useStudentExaminations,
  StudentExamCourse,
} from '@/hooks/api/student/useStudentExaminations';

export default function StudentExaminationsPage() {
  const { data: exams = [], isLoading, error } = useStudentExaminations();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const now = new Date();

  // Filtered examinations
  const filteredExams = useMemo(() => {
    return exams.filter((ec) => {
      const q = search.toLowerCase();
      const matchCourse =
        ec.course?.name.toLowerCase().includes(q) || ec.course?.code.toLowerCase().includes(q);
      const matchExam = ec.exam?.name.toLowerCase().includes(q);
      return matchCourse || matchExam;
    });
  }, [exams, search]);

  const upcomingExams = useMemo(() => {
    return filteredExams.filter((ec) => {
      const examDate = new Date(ec.examDate);
      // Either date is in the future/today or no mark has been logged yet
      return !ec.mark || examDate >= new Date(now.setHours(0, 0, 0, 0));
    });
  }, [filteredExams, now]);

  const completedExams = useMemo(() => {
    return filteredExams.filter((ec) => !!ec.mark);
  }, [filteredExams]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = exams.length;
    const gradedList = exams.filter((ec) => ec.mark && typeof ec.mark.percentage === 'number');
    const upcomingCount = exams.filter((ec) => !ec.mark).length;

    let avgPercentage: number | null = null;
    if (gradedList.length > 0) {
      const sum = gradedList.reduce((acc, curr) => acc + (curr.mark?.percentage || 0), 0);
      avgPercentage = Math.round(sum / gradedList.length);
    }

    return {
      totalCount,
      upcomingCount,
      completedCount: gradedList.length,
      avgPercentage,
    };
  }, [exams]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PASS':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">
            PASS
          </Badge>
        );
      case 'FAIL':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400">
            FAIL
          </Badge>
        );
      case 'ABSENT':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400">
            ABSENT
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || 'PENDING'}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
        <AlertCircle className="h-8 w-8" />
        <h3 className="font-semibold">Failed to load examinations</h3>
        <p className="text-sm">Please try refreshing the page later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold tracking-tight">
            My Examinations & Grades
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View exam schedules, total marks, and published grades.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Upcoming Exams
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{metrics.upcomingCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">Awaiting examination & grading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Graded Courses
            </CardTitle>
            <FileCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{metrics.completedCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">Exams with published marks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Average Score
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">
              {metrics.avgPercentage !== null ? `${metrics.avgPercentage}%` : 'N/A'}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Cumulative across logged exams</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Examination List</CardTitle>
              <CardDescription>
                Detailed overview of upcoming exam schedules and published grades.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search course or exam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'upcoming' | 'completed')}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming ({upcomingExams.length})</TabsTrigger>
              <TabsTrigger value="completed">
                Completed & Grades ({completedExams.length})
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Tab */}
            <TabsContent value="upcoming" className="space-y-4">
              {upcomingExams.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center text-sm">
                  No upcoming examinations found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingExams.map((item) => {
                    const formattedDate = format(new Date(item.examDate), 'EEE, MMM d, yyyy');
                    const startTimeStr = format(new Date(item.startTime), 'hh:mm a');
                    const endTimeStr = format(new Date(item.endTime), 'hh:mm a');

                    return (
                      <div
                        key={item.id}
                        className="bg-card border-border hover:border-primary/50 relative flex flex-col justify-between rounded-lg border p-5 shadow-xs transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-semibold">
                              {item.course.code}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.exam.examType || 'EXAM'}
                            </Badge>
                          </div>

                          <div>
                            <h3 className="text-foreground text-base leading-snug font-medium">
                              {item.course.name}
                            </h3>
                            <p className="text-muted-foreground text-xs">{item.exam.name}</p>
                          </div>

                          <div className="text-muted-foreground space-y-1.5 pt-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {startTimeStr} - {endTimeStr}
                              </span>
                            </div>
                            {item.room && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span>
                                  Room {item.room.number || item.room.name}{' '}
                                  {item.room.building?.name ? `(${item.room.building.name})` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                          <span className="text-muted-foreground">Max Marks:</span>
                          <span className="text-foreground font-semibold">
                            {item.maxMarks != null ? item.maxMarks : '100'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Completed & Grades Tab */}
            <TabsContent value="completed" className="space-y-4">
              {completedExams.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center text-sm">
                  No graded examinations available yet.
                </div>
              ) : (
                <div className="border-border overflow-x-auto rounded-md border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/60 text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="p-3">Course</th>
                        <th className="p-3">Exam Type</th>
                        <th className="p-3 text-right">Marks</th>
                        <th className="p-3 text-right">Percentage</th>
                        <th className="p-3 text-center">Grade</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                      {completedExams.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <div className="text-foreground font-medium">{item.course.name}</div>
                            <div className="text-muted-foreground text-xs">{item.course.code}</div>
                          </td>
                          <td className="p-3 text-xs">
                            <div>{item.exam.name}</div>
                            <span className="text-muted-foreground text-[11px]">
                              {item.exam.examType}
                            </span>
                          </td>
                          <td className="p-3 text-right font-medium">
                            {item.mark?.marksObtained != null ? item.mark.marksObtained : '-'} /{' '}
                            <span className="text-muted-foreground text-xs">
                              {item.maxMarks != null ? item.maxMarks : 100}
                            </span>
                          </td>
                          <td className="p-3 text-right font-medium">
                            {item.mark?.percentage != null ? `${item.mark.percentage}%` : '-'}
                          </td>
                          <td className="p-3 text-center">
                            {item.mark?.grade ? (
                              <span className="bg-muted inline-block min-w-[28px] rounded px-1.5 py-0.5 font-bold">
                                {item.mark.grade}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {getStatusBadge(item.mark?.resultStatus)}
                          </td>
                          <td className="text-muted-foreground p-3 text-xs">
                            {item.mark?.remarks || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
