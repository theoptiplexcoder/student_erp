import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@student-erp/ui';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Badge } from '@student-erp/ui';
import { MessageSquare, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

export default function FeedbackPage() {
  const pendingFeedback = [
    {
      id: 1,
      title: 'End Semester Course Feedback',
      target: 'CS301 - Data Structures',
      deadline: 'Oct 25, 2023',
    },
    {
      id: 2,
      title: 'Faculty Evaluation',
      target: 'Dr. Sarah Lee (CS302)',
      deadline: 'Oct 25, 2023',
    },
  ];

  const myGrievances = [
    {
      id: 'GRV-001',
      subject: 'Hostel WiFi Connectivity Issue',
      date: 'Oct 12, 2023',
      status: 'IN_PROGRESS',
      category: 'Infrastructure',
    },
    {
      id: 'GRV-002',
      subject: 'Library Fine Discrepancy',
      date: 'Sep 28, 2023',
      status: 'RESOLVED',
      category: 'Library',
    },
  ];

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Feedback & Support</h1>
        <p className="text-muted-foreground mt-1">Submit course feedback or raise a grievance.</p>
      </div>

      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="feedback">Feedback Forms</TabsTrigger>
          <TabsTrigger value="grievances">My Grievances</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingFeedback.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="text-base">{form.title}</CardTitle>
                  <CardDescription>{form.target}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex items-center text-sm">
                    <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                    Due by: {form.deadline}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Fill Feedback</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grievances" className="mt-6">
          <div className="mb-6 flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Raise Grievance
            </Button>
          </div>

          <div className="space-y-4">
            {myGrievances.map((grievance) => (
              <Card key={grievance.id}>
                <div className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        {grievance.id}
                      </span>
                      <Badge variant="outline">{grievance.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{grievance.subject}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Raised on: {grievance.date}
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-4 sm:w-auto">
                    <Badge
                      variant={grievance.status === 'RESOLVED' ? 'secondary' : 'default'}
                      className="px-3 py-1"
                    >
                      {grievance.status.replace('_', ' ')}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
