'use client';

import Link from 'next/link';
import { useAdminDashboard } from '@/hooks/api/admin/useDashboard';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Badge,
  Skeleton,
} from '@student-erp/ui';
import {
  Users,
  GraduationCap,
  CalendarDays,
  FileText,
  AlertTriangle,
  AlertCircle,
  UserPlus,
  Megaphone,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { data: dashboard, isLoading, isError, refetch } = useAdminDashboard();

  if (isError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Failed to load dashboard
        </h2>
        <p className="mb-6 text-gray-500">There was an error communicating with the server.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (isLoading || !dashboard || !dashboard.kpis) {
    return (
      <div className="min-h-screen space-y-8 bg-gray-50/50 p-8 dark:bg-gray-900/50">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 rounded-xl md:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const { kpis, attentionRequired, grievances, academicHealth, admissions } = dashboard;

  const stats = [
    {
      label: 'Total Active Students',
      value: kpis.activeStudents.current,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      href: '/admin/students',
    },
    {
      label: 'Active Faculty',
      value: kpis.activeFaculty.current,
      icon: GraduationCap,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      href: '/admin/faculty',
    },
    {
      label: 'Attendance Rate',
      value: `${kpis.attendanceRate.percentage}%`,
      icon: CheckCircle2,
      color: kpis.attendanceRate.percentage >= 75 ? 'text-green-500' : 'text-red-500',
      bg: kpis.attendanceRate.percentage >= 75 ? 'bg-green-500/10' : 'bg-red-500/10',
      href: '/admin/attendance/reports',
    },
    {
      label: 'Pending Admissions',
      value: kpis.pendingAdmissions.current,
      icon: FileText,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      href: '/admin/admissions/applications',
    },
    {
      label: 'Open Grievances',
      value: kpis.openGrievances.current,
      icon: AlertTriangle,
      color: kpis.openGrievances.current > 0 ? 'text-red-500' : 'text-gray-500',
      bg: kpis.openGrievances.current > 0 ? 'bg-red-500/10' : 'bg-gray-500/10',
      href: '/admin/grievances',
    },
  ];

  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-6 md:p-8 dark:bg-gray-900/50">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">
          Admin Command Center
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Overview of institutional health and actionable insights.
        </p>
      </div>

      {/* CORE KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="focus:ring-primary block rounded-xl focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-full"
            >
              <Card className="group relative h-full overflow-hidden border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    {stat.label}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* NEEDS ATTENTION */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              Needs Attention
            </h2>
          </div>
          <Card className="flex-1 shadow-sm">
            <CardContent className="p-0">
              {attentionRequired.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-gray-500">
                  <CheckCircle2 className="mb-2 h-8 w-8 text-green-500/50" />
                  <p>All caught up. No pending critical tasks.</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-800">
                  {attentionRequired.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${item.severity === 'HIGH' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}
                        >
                          {item.severity === 'HIGH' ? (
                            <AlertTriangle className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge
                              variant={item.severity === 'HIGH' ? 'destructive' : 'secondary'}
                              className="text-[10px]"
                            >
                              {item.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Link href={item.link}>
                        <Button variant="ghost" size="sm" className="text-primary gap-1">
                          {item.actionText}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <Card className="flex-1 shadow-sm">
            <CardContent className="grid grid-cols-2 gap-2 p-4">
              <Link href="/admin/admissions/students/new" className="block">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-center justify-center gap-2 p-4 text-xs"
                >
                  <UserPlus className="h-5 w-5 text-blue-500" />
                  Add Student
                </Button>
              </Link>
              <Link href="/admin/admissions/applications" className="block">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-center justify-center gap-2 p-4 text-xs"
                >
                  <ClipboardList className="h-5 w-5 text-orange-500" />
                  Review Admissions
                </Button>
              </Link>
              <Link href="/admin/faculty/new" className="block">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-center justify-center gap-2 p-4 text-xs"
                >
                  <Users className="h-5 w-5 text-purple-500" />
                  Add Faculty
                </Button>
              </Link>
              <Link href="/admin/examinations/timetable" className="block">
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-center justify-center gap-2 p-4 text-xs"
                >
                  <CalendarDays className="h-5 w-5 text-green-500" />
                  Schedule Exam
                </Button>
              </Link>
              <Link href="/admin/communication/announcements" className="col-span-2 block">
                <Button variant="outline" className="h-auto w-full justify-start gap-3 p-4">
                  <Megaphone className="h-5 w-5 text-pink-500" />
                  Send Announcement
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* GRIEVANCES & CRITICAL ISSUES */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              Grievances & Critical Issues
            </h2>
          </div>
          <Card className="flex-1 shadow-sm">
            <CardContent className="p-0">
              {grievances.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-gray-500">
                  <p>No unresolved grievances.</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-800">
                  {grievances.map((grievance) => (
                    <div key={grievance.id} className="flex items-start justify-between p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              grievance.priority === 'URGENT' || grievance.priority === 'HIGH'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {grievance.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">{grievance.category}</span>
                          <span className="text-xs text-gray-400">
                            &bull; {new Date(grievance.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 font-medium text-gray-900 dark:text-white">
                          {grievance.subject}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary shrink-0">
                        Review <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {kpis.openGrievances.current > 5 && (
                    <div className="bg-gray-50 p-2 text-center dark:bg-gray-800/50">
                      <Link
                        href="/admin/grievances"
                        className="text-primary text-sm hover:underline"
                      >
                        View all {kpis.openGrievances.current} grievances &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ACADEMIC HEALTH & ADMISSIONS */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              Academic Health
            </h2>
            <Card className="shadow-sm">
              <CardContent className="space-y-4 p-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Attendance Health</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{academicHealth.attendanceAverage}%</span>
                    <span className="text-sm text-gray-500">average</span>
                  </div>
                  {academicHealth.lowAttendanceStudents > 0 && (
                    <p className="mt-1 text-sm text-red-500">
                      {academicHealth.lowAttendanceStudents} students below threshold
                    </p>
                  )}
                </div>
                <div className="h-px bg-gray-100 dark:bg-gray-800" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Examination Readiness</p>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xl font-bold">{academicHealth.upcomingExams}</p>
                      <p className="text-xs text-gray-500">Upcoming Exams</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{academicHealth.resultsPending}</p>
                      <p className="text-xs text-gray-500">Results Pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              Admissions Funnel
            </h2>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Applications</span>
                    </div>
                    <span className="font-semibold">{admissions.applicants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Admitted</span>
                    </div>
                    <span className="font-semibold">{admissions.admitted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Enrolled</span>
                    </div>
                    <span className="font-semibold">{admissions.enrolled}</span>
                  </div>
                  {admissions.applicants > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <TrendingUp className="mr-1 inline h-3 w-3" />
                      {admissions.applicants} applications require review.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
