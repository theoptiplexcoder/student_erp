'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Calendar as CalIcon, Plus, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/institution/calendar')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setEvents(res.data);
        } else {
          setEvents([
            { id: 1, title: 'Fall Semester Begins', date: '2024-08-15', type: 'academic' },
            { id: 2, title: 'Thanksgiving Break', date: '2024-11-25', type: 'holiday' },
            { id: 3, title: 'Final Exams', date: '2024-12-10', type: 'exam' },
          ]);
        }
      })
      .catch((err) => {
        console.error(err);
        setEvents([
          { id: 1, title: 'Fall Semester Begins', date: '2024-08-15', type: 'academic' },
          { id: 2, title: 'Thanksgiving Break', date: '2024-11-25', type: 'holiday' },
          { id: 3, title: 'Final Exams', date: '2024-12-10', type: 'exam' },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300';
      case 'exam':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <CalIcon className="h-8 w-8 text-purple-600" /> Institutional Calendar
          </h1>
          <p className="text-muted-foreground mt-2">
            Schedule events, holidays, and important dates.
          </p>
        </div>
        <Button className="flex h-11 items-center gap-2 rounded-full bg-purple-600 px-6 text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl">
          <Plus className="h-5 w-5" /> Add Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {!loading &&
            events.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className={`flex items-center justify-between rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${getTypeColor(ev.type)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-white/50 font-bold dark:bg-black/20">
                      <span className="text-xs uppercase">
                        {new Date(ev.date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-lg leading-none">{new Date(ev.date).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{ev.title}</h4>
                      <p className="text-sm capitalize opacity-80">{ev.type}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
        <div className="space-y-4">
          <Card className="border-none bg-gradient-to-br from-purple-50 to-white shadow-lg dark:from-purple-900/20 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-500" /> Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div> Academic Events
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-rose-500"></div> Holidays
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div> Examinations
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
