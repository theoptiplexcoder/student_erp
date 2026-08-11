import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@student-erp/ui";
import { Button } from "@student-erp/ui";
import { Badge } from "@student-erp/ui";
import { Bell, BookOpen, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const notifications = [
    { id: 1, title: "Attendance Warning", type: "WARNING", message: "Your attendance in CS303 is below 75%. Please meet your advisor.", time: "1 hour ago", icon: AlertTriangle, color: "text-destructive" },
    { id: 2, title: "Assignment Graded", type: "INFO", message: "Network Setup Report has been graded. You scored 9/10.", time: "4 hours ago", icon: CheckCircle2, color: "text-green-500" },
    { id: 3, title: "New Course Material", type: "UPDATE", message: "Prof. Alan Smith uploaded new slides for Graph Algorithms.", time: "1 day ago", icon: BookOpen, color: "text-blue-500" },
    { id: 4, title: "Certificate Ready", type: "UPDATE", message: "Your Bonafide Certificate is ready to download.", time: "2 days ago", icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your academic alerts.</p>
        </div>
        <Button variant="outline">
          Mark All as Read
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map(notif => (
              <div key={notif.id} className="p-4 sm:p-6 hover:bg-muted/50 transition-colors flex gap-4">
                <div className={`mt-1 bg-muted p-2 rounded-full ${notif.color} bg-opacity-10`}>
                  <notif.icon className={`h-5 w-5 ${notif.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{notif.title}</h4>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  <div className="pt-2">
                    <Button variant="link" className="px-0 h-auto text-xs" asChild>
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
