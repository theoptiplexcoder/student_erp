import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { recentAnnouncements } from '@/lib/mock/student/data';
import { Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function RecentAnnouncements() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg">Announcements</CardTitle>
        <Link
          href="/student/notifications"
          className="text-primary flex items-center text-sm hover:underline"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {recentAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="text-sm font-medium">{announcement.title}</h4>
                  </div>
                  <p className="text-muted-foreground mb-2 text-xs leading-relaxed">
                    {announcement.summary}
                  </p>
                  <span className="text-muted-foreground text-[10px] font-medium uppercase">
                    {announcement.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-6 text-center">
            <Bell className="mb-2 h-8 w-8 opacity-20" />
            <p>No new announcements.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
