'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Users, BookOpen, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TenantAdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/dashboard') // Updated endpoint
      .then((res) => {
        const data = res.data;
        // Map new API response structure to what this legacy component expects
        setSummary({
          enrolledStudents: data.kpis?.activeStudents?.current || 0,
          activeCourses: data.academicHealth?.upcomingExams || 0, // Fallback proxy
          attendanceRate: data.kpis?.attendanceRate?.percentage || 0,
          pendingAlerts:
            (data.attentionRequired?.length || 0) + (data.kpis?.openGrievances?.current || 0),
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Enrolled Students',
      value: summary?.enrolledStudents || 0,
      icon: Users,
      color: 'text-indigo-500',
    },
    {
      label: 'Active Courses',
      value: summary?.activeCourses || 0,
      icon: BookOpen,
      color: 'text-emerald-500',
    },
    {
      label: 'Daily Attendance',
      value: summary?.attendanceRate ? `${summary.attendanceRate}%` : '0%',
      icon: Activity,
      color: 'text-rose-500',
    },
    {
      label: 'Pending Alerts',
      value: summary?.pendingAlerts || 0,
      icon: AlertCircle,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-br from-indigo-50 to-white p-8 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Tenant Dashboard
          </h1>
          <p className="mt-2 text-gray-500">Manage your institution efficiently.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden rounded-2xl border-none bg-white/80 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-800/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {stat.label}
                  </CardTitle>
                  <stat.icon
                    className={`h-5 w-5 ${stat.color} transition-transform group-hover:scale-110`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="mt-2 text-4xl font-black text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                </CardContent>
                <div
                  className={`absolute bottom-0 left-0 h-1 w-full opacity-50 ${stat.color.replace('text', 'bg')}`}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
