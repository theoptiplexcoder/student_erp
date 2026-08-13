'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Building, Users, GraduationCap, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Total Students',
      value: summary?.totalStudents || 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Institutions',
      value: summary?.totalInstitutions || 0,
      icon: Building,
      color: 'text-purple-500',
    },
    {
      label: 'Programs',
      value: summary?.totalPrograms || 0,
      icon: GraduationCap,
      color: 'text-green-500',
    },
    {
      label: 'Active Events',
      value: summary?.activeEvents || 0,
      icon: Calendar,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="min-h-screen space-y-8 bg-gray-50/50 p-8 dark:bg-gray-900/50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative h-full overflow-hidden border-none bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-gray-800">
                <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 transform p-4 opacity-5 transition-transform duration-300 group-hover:scale-110">
                  <stat.icon size={80} className={stat.color} />
                </div>
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {stat.label}
                  </CardTitle>
                  <div
                    className={`bg-opacity-10 rounded-full p-2 backdrop-blur-md ${stat.color.replace('text', 'bg')}`}
                  >
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
