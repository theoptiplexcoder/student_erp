import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Badge } from '@student-erp/ui';
import { Bell, BookOpen, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: 'Attendance Warning',
      type: 'WARNING',
      message: 'Your attendance in CS303 is below 75%. Please meet your advisor.',
      time: '1 hour ago',
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      id: 2,
      title: 'Assignment Graded',
      type: 'INFO',
      message: 'Network Setup Report has been graded. You scored 9/10.',
      time: '4 hours ago',
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      id: 3,
      title: 'New Course Material',
      type: 'UPDATE',
      message: 'Prof. Alan Smith uploaded new slides for Graph Algorithms.',
      time: '1 day ago',
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      id: 4,
      title: 'Certificate Ready',
      type: 'UPDATE',
      message: 'Your Bonafide Certificate is ready to download.',
      time: '2 days ago',
      icon: FileText,
      color: 'text-primary',
    },
  ];

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
          <div className="divide-y">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="hover:bg-muted/50 flex gap-4 p-4 transition-colors sm:p-6"
              >
                <div className={`bg-muted mt-1 rounded-full p-2 ${notif.color} bg-opacity-10`}>
                  <notif.icon className={`h-5 w-5 ${notif.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{notif.title}</h4>
                    <span className="text-muted-foreground text-xs">{notif.time}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{notif.message}</p>
                  <div className="pt-2">
                    <Button variant="link" className="h-auto px-0 text-xs" asChild>
                      <Link href="#">View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
