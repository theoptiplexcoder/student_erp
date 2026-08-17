'use client';

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
import { useStudentFeedback, useStudentGrievances } from '@student-erp/hooks';
import { RaiseGrievanceDialog } from './raise-grievance-dialog';

export default function FeedbackPage() {
  const { data: feedbackData, isPending: isFeedbackPending } = useStudentFeedback();
  const { data: grievancesData, isPending: isGrievancesPending } = useStudentGrievances();

  const pendingFeedback = feedbackData?.forms || [];
  const myGrievances = grievancesData || [];

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
          {isFeedbackPending ? (
            <div className="text-muted-foreground mt-10 text-center">Loading...</div>
          ) : pendingFeedback.length === 0 ? (
            <div className="text-muted-foreground mt-10 text-center">No active feedback forms.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingFeedback.map((form: any) => (
                <Card key={form.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{form.title}</CardTitle>
                    <CardDescription>{form.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full">Fill Feedback</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="grievances" className="mt-6">
          <div className="mb-6 flex justify-end">
            <RaiseGrievanceDialog />
          </div>

          {isGrievancesPending ? (
            <div className="text-muted-foreground mt-10 text-center">Loading...</div>
          ) : myGrievances.length === 0 ? (
            <div className="text-muted-foreground mt-10 text-center">No grievances raised yet.</div>
          ) : (
            <div className="space-y-4">
              {myGrievances.map((grievance: any) => (
                <Card key={grievance.id}>
                  <div className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="outline">{grievance.category}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{grievance.subject}</h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Raised on: {new Date(grievance.createdAt).toLocaleDateString()}
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
