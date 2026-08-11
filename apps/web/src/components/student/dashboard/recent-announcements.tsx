import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@student-erp/ui";
import { recentAnnouncements } from "@/lib/mock/student/data";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

export function RecentAnnouncements() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Announcements</CardTitle>
        <Link href="/student/notifications" className="text-sm text-primary hover:underline flex items-center">
          View all <ChevronRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {recentAnnouncements.length > 0 ? (
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => (
              <div key={announcement.id} className="flex gap-3 items-start pb-4 border-b last:border-0 last:pb-0">
                <div className="mt-0.5 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{announcement.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {announcement.summary}
                  </p>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    {announcement.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-20" />
            <p>No new announcements.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
