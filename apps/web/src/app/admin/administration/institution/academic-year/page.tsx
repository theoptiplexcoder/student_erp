'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import Link from 'next/link';
import { BookMarked, Plus, Calendar as CalIcon, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AcademicYear() {
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/institution/academic-years')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setYears(res.data);
        } else if (res.data?.data) {
          setYears(res.data.data);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <BookMarked className="h-8 w-8 text-emerald-600" /> Academic Years
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage past, current, and upcoming academic sessions.
          </p>
        </div>
        <Button className="flex h-11 items-center gap-2 rounded-full bg-emerald-600 px-6 text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl">
          <Plus className="h-5 w-5" /> New Session
        </Button>
      </div>

      <div className="grid gap-6">
        {!loading &&
          years.map((year, i) => (
            <motion.div
              key={year.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group overflow-hidden border-l-4 border-l-emerald-500 transition-all hover:shadow-md">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                      {year.name}
                      {year.isActive && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Active
                        </span>
                      )}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <CalIcon className="h-4 w-4" />
                      <span>
                        {new Date(year.startDate).toLocaleDateString()} to{' '}
                        {new Date(year.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <Link href={`/admin/administration/institution/academic-year/${year.id}`}>
                      <Button variant="outline" className="flex items-center gap-2 rounded-full">
                        Manage Terms <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
