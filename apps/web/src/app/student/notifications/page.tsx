'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Badge } from '@student-erp/ui';
import { Bell, BookOpen, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useStudentNotifications } from '@student-erp/hooks';

export default function NotificationsPage() {
  const { data: notifications = [], isPending } = useStudentNotifications();

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-6 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your academic alerts.</p>
        </div>
        <Button variant="outline">Mark All as Read</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isPending ? (
            <div className="text-muted-foreground p-10 text-center">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-muted-foreground p-10 text-center">No notifications yet.</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className="hover:bg-muted/50 flex gap-4 p-4 transition-colors sm:p-6"
                >
                  <div className="bg-muted bg-opacity-10 text-primary mt-1 rounded-full p-2">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{notif.title}</h4>
                      <span className="text-muted-foreground text-xs">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
