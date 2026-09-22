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
  PageHeader,
  PageContainer,
  StatCard,
  StatusBadge,
  EmptyState,
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
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  CalendarCheck,
  Award,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { data: dashboard, isLoading, isError, refetch } = useAdminDashboard();

  if (isError) {
    return (
      <PageContainer>
        <EmptyState
          icon={AlertCircle}
          title="Failed to load dashboard"
          description="There was an error communicating with the server. Please check your network connection and retry."
          action={{
            label: 'Try Again',
            onClick: () => refetch(),
          }}
        />
      </PageContainer>
    );
  }

  if (isLoading || !dashboard || !dashboard.kpis) {
    return (
      <PageContainer>
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Skeleton className="h-72 rounded-xl md:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  const { kpis, attentionRequired, grievances, academicHealth, admissions } = dashboard;

  const stats = [
    {
      label: 'Active Students',
      value: kpis.activeStudents.current.toLocaleString(),
      icon: Users,
      trend: {
        value: '+3.2%',
        direction: 'up' as const,
        label: 'vs last month',
      },
      href: '/admin/students',
    },
    {
      label: 'Active Faculty',
      value: kpis.activeFaculty.current.toLocaleString(),
      icon: GraduationCap,
      trend: {
        value: '+1.0%',
        direction: 'up' as const,
        label: 'vs last term',
      },
      href: '/admin/faculty',
    },
    {
      label: 'Attendance Rate',
      value: `${kpis.attendanceRate.percentage}%`,
      icon: CheckCircle2,
      trend: {
        value: kpis.attendanceRate.percentage >= 75 ? 'Healthy' : 'Needs attention',
        direction: kpis.attendanceRate.percentage >= 75 ? ('up' as const) : ('down' as const),
      },
      href: '/admin/attendance/reports',
    },
    {
      label: 'Pending Admissions',
      value: kpis.pendingAdmissions.current.toLocaleString(),
      icon: FileText,
      subtitle: `${admissions.applicants} total applicants`,
      href: '/admin/admissions/applications',
    },
    {
      label: 'Open Grievances',
      value: kpis.openGrievances.current.toLocaleString(),
      icon: AlertTriangle,
      trend: {
        value: kpis.openGrievances.current > 0 ? 'Action required' : 'Resolved',
        direction: kpis.openGrievances.current > 0 ? ('down' as const) : ('neutral' as const),
      },
      href: '/admin/grievances',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Admin Overview"
        description="Monitor institutional health, academic operations, and prioritize pending administrative actions."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/timetable">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <CalendarCheck className="h-3.5 w-3.5" />
                Generate Timetable
              </Button>
            </Link>
            <Link href="/admin/admissions/students/new">
              <Button size="sm" className="h-8 gap-1.5 text-xs shadow-xs">
                <UserPlus className="h-3.5 w-3.5" />
                Add Student
              </Button>
            </Link>
          </div>
        }
      />

      {/* CORE STATS (STRIPE-STYLE RESTRAINED KPI TILES) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group focus:ring-primary block rounded-xl focus:ring-2 focus:ring-offset-1 focus:outline-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="h-full"
            >
              <StatCard
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                subtitle={stat.subtitle}
                className="group-hover:border-primary/40 transition-colors group-hover:shadow-xs"
              />
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* NEEDS ATTENTION (JIRA/ATLASSIAN TRIAGE SECTION) */}
        <div className="flex flex-col gap-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-foreground font-display text-base font-semibold tracking-tight">
                Attention Required
              </h2>
              <p className="text-muted-foreground text-xs">
                High-priority workflows requiring administrative sign-off or intervention.
              </p>
            </div>
            {attentionRequired && attentionRequired.length > 0 && (
              <Badge variant="warning" className="text-[11px]">
                {attentionRequired.length} items
              </Badge>
            )}
          </div>

          <Card className="border-border/80 flex-1 shadow-xs">
            <CardContent className="p-0">
              {!attentionRequired || attentionRequired.length === 0 ? (
                <div className="text-muted-foreground flex h-44 flex-col items-center justify-center">
                  <CheckCircle2 className="mb-2 h-7 w-7 text-emerald-500/80" />
                  <p className="text-foreground text-sm font-medium">All clear</p>
                  <p className="text-muted-foreground text-xs">
                    No pending critical tasks requiring attention.
                  </p>
                </div>
              ) : (
                <div className="divide-border/60 divide-y">
                  {attentionRequired.map((item, idx) => (
                    <div
                      key={idx}
                      className="hover:bg-muted/40 flex items-center justify-between p-3.5 transition-colors sm:p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3 pr-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                            item.severity === 'HIGH'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                          }`}
                        >
                          {item.severity === 'HIGH' ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-sm font-medium">
                            {item.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <StatusBadge
                              status={item.severity === 'HIGH' ? 'rejected' : 'pending'}
                              size="sm"
                              statusText={item.severity}
                            />
                            <span className="text-muted-foreground truncate text-xs">
                              {item.count} items pending
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link href={item.link} className="shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/10 hover:text-primary h-8 gap-1 text-xs"
                        >
                          {item.actionText}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QUICK ACTIONS PANEL */}
        <div className="flex flex-col gap-3">
          <div className="space-y-0.5">
            <h2 className="text-foreground font-display text-base font-semibold tracking-tight">
              Quick Actions
            </h2>
            <p className="text-muted-foreground text-xs">
              Direct short-cuts to common administrative tasks.
            </p>
          </div>

          <Card className="border-border/80 flex-1 shadow-xs">
            <CardContent className="grid grid-cols-2 gap-2.5 p-3.5 sm:p-4">
              <Link href="/admin/admissions/students/new" className="block">
                <Button
                  variant="outline"
                  className="border-border/70 hover:border-primary/40 hover:bg-muted/40 h-auto w-full flex-col items-center justify-center gap-2 p-3 text-xs"
                >
                  <UserPlus className="text-primary h-4 w-4" />
                  <span className="font-medium">Add Student</span>
                </Button>
              </Link>
              <Link href="/admin/faculty/new" className="block">
                <Button
                  variant="outline"
                  className="border-border/70 hover:border-primary/40 hover:bg-muted/40 h-auto w-full flex-col items-center justify-center gap-2 p-3 text-xs"
                >
                  <Users className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">Add Faculty</span>
                </Button>
              </Link>
              <Link href="/admin/examinations/timetable" className="col-span-2 block">
                <Button
                  variant="outline"
                  className="border-border/70 hover:border-primary/40 hover:bg-muted/40 h-auto w-full flex-row items-center justify-center gap-2 p-2.5 text-xs"
                >
                  <CalendarCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">Schedule Examination</span>
                </Button>
              </Link>
              <Link href="/admin/communication/announcements/new" className="col-span-2 block">
                <Button
                  variant="outline"
                  className="border-border/70 hover:border-primary/40 hover:bg-muted/40 h-auto w-full flex-row items-center justify-center gap-2 p-2.5 text-xs"
                >
                  <Megaphone className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Publish Announcement</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RECENT ACTIVITY & SUMMARY GRIDS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* GRIEVANCES & TICKETS */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-3 sm:p-5">
            <div>
              <CardTitle className="text-base font-semibold">Active Grievances</CardTitle>
              <CardDescription className="text-xs">
                Recent unresolved tickets from students or faculty.
              </CardDescription>
            </div>
            <Link href="/admin/grievances">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-7 text-xs"
              >
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {!grievances || grievances.length === 0 ? (
              <div className="text-muted-foreground p-6 text-center text-xs">
                No active grievances reported.
              </div>
            ) : (
              <div className="divide-border/60 divide-y">
                {grievances.slice(0, 4).map((g) => (
                  <div
                    key={g.id}
                    className="hover:bg-muted/40 flex items-center justify-between p-3.5 transition-colors sm:p-4"
                  >
                    <div className="space-y-0.5 truncate pr-3">
                      <p className="text-foreground truncate text-xs font-medium">
                        {g.subject || 'Untitled Grievance'}
                      </p>
                      <p className="text-muted-foreground truncate text-[11px]">
                        Category: {g.category} •{' '}
                        {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        g.status === 'RESOLVED'
                          ? 'completed'
                          : g.status === 'IN_PROGRESS'
                            ? 'in_progress'
                            : 'pending'
                      }
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RECENT ADMISSIONS PIPELINE */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-3 sm:p-5">
            <div>
              <CardTitle className="text-base font-semibold">Admissions Funnel</CardTitle>
              <CardDescription className="text-xs">
                Applicant lifecycle state for current academic session.
              </CardDescription>
            </div>
            <Link href="/admin/admissions/applications">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-7 text-xs"
              >
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border-border/60 bg-muted/20 rounded-lg border p-3">
                <span className="text-muted-foreground text-[11px] font-medium uppercase">
                  Applicants
                </span>
                <p className="text-foreground font-display mt-1 text-lg font-bold">
                  {admissions.applicants}
                </p>
              </div>
              <div className="border-border/60 bg-muted/20 rounded-lg border p-3">
                <span className="text-muted-foreground text-[11px] font-medium uppercase">
                  Admitted
                </span>
                <p className="font-display mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                  {admissions.admitted}
                </p>
              </div>
              <div className="border-border/60 bg-muted/20 rounded-lg border p-3">
                <span className="text-muted-foreground text-[11px] font-medium uppercase">
                  Enrolled
                </span>
                <p className="font-display mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {admissions.enrolled}
                </p>
              </div>
            </div>
            <div className="text-muted-foreground border-border/50 mt-4 flex items-center justify-between border-t pt-2 text-xs">
              <span>Conversion Rate</span>
              <span className="text-foreground font-semibold">
                {admissions.applicants > 0
                  ? `${Math.round((admissions.enrolled / admissions.applicants) * 100)}%`
                  : '0%'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
