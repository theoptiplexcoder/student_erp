'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@student-erp/ui';
import { useAdmissionsStats, useRecentAdmissions } from '@/hooks/api/admin/useAdmissions';
import {
  Users,
  UserPlus,
  Clock,
  ArrowRight,
  Loader2,
  FileText,
  IndianRupee,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdmissionsDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdmissionsStats();
  const { data: recent, isLoading: recentLoading } = useRecentAdmissions();

  const kpis = [
    {
      label: 'Applications',
      value: stats?.applications || 0,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      label: 'Pending Review',
      value: stats?.pendingReview || 0,
      icon: Clock,
      color: 'text-orange-500',
    },
    {
      label: 'Ready for Enrollment',
      value: stats?.readyForEnrollment || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: 'Fee Outstanding',
      value: `₹${(stats?.feeOutstanding || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Admissions</h1>
          <p className="text-muted-foreground mt-1">
            Manage applications, direct admissions, enrollment and fee setup.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/admissions/applications">
              <FileText className="mr-2 h-4 w-4" /> Review Applications
            </Link>
          </Button>
          <Button
            asChild
            className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground"
          >
            <Link href="/admin/admissions/students/new">
              <UserPlus className="mr-2 h-4 w-4" /> Add Student Directly
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-28 animate-pulse bg-gray-100/50 dark:bg-gray-800/50" />
            ))
          : kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* REQUIRES ATTENTION & ADMISSIONS PIPELINE */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Requires Attention</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <div className="space-y-4">
                  {(stats?.pendingReview ?? 0) > 0 && (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {stats?.pendingReview} applications waiting for review
                        </p>
                      </div>
                      <Link
                        href="/admin/admissions/applications"
                        className="text-admin-primary text-sm"
                      >
                        Review
                      </Link>
                    </div>
                  )}
                  {(stats?.feeOutstanding ?? 0) > 0 && (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Overdue admission fees</p>
                      </div>
                      <Link href="/admin/finance" className="text-admin-primary text-sm">
                        View
                      </Link>
                    </div>
                  )}
                  {(stats?.pendingReview ?? 0) === 0 && (stats?.feeOutstanding ?? 0) === 0 && (
                    <p className="text-muted-foreground py-4 text-center text-sm">
                      All caught up. No pending critical tasks.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admissions Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-semibold">{stats?.applications || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Under Review</span>
                  <span className="font-semibold">{stats?.pendingReview || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Accepted / Enrollable</span>
                  <span className="font-semibold">{stats?.readyForEnrollment || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enrolled</span>
                  <span className="font-semibold">{stats?.admittedStudents || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECENT ADMISSIONS */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Admissions</CardTitle>
                <CardDescription>Recently admitted students across all programs.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/students">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : !recent || recent.length === 0 ? (
                <div className="text-muted-foreground py-12 text-center text-sm">
                  No recent admissions found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-muted-foreground bg-muted/50 text-xs uppercase">
                      <tr>
                        <th className="rounded-tl-md px-4 py-3">Student</th>
                        <th className="px-4 py-3">Program</th>
                        <th className="px-4 py-3">Fee Plan</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="rounded-tr-md px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((student: any) => (
                        <tr key={student.id} className="hover:bg-muted/50 border-b last:border-0">
                          <td className="px-4 py-3 font-medium">
                            {student.user?.firstName} {student.user?.lastName}
                            <div className="text-muted-foreground text-xs font-normal">
                              {student.admissionNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3">{student.program?.name || 'N/A'}</td>
                          <td className="px-4 py-3">
                            {student.feePlans?.[0] ? (
                              <div>
                                ₹{student.feePlans[0].totalAmount.toLocaleString()}
                                <div className="text-muted-foreground text-xs">
                                  {student.feePlans[0].paymentMode === 'INSTALLMENTS'
                                    ? '4 Installments'
                                    : 'Annual'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No fee plan</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                student.lifecycleStatus === 'ENROLLED' ? 'default' : 'secondary'
                              }
                            >
                              {student.lifecycleStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/students/${student.studentCode || student.id}`}>
                                View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
