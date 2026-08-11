import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@student-erp/ui";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@student-erp/ui";
import { Button } from "@student-erp/ui";
import { Badge } from "@student-erp/ui";
import { MessageSquare, AlertCircle, Plus, CheckCircle2 } from "lucide-react";

export default function FeedbackPage() {
  const pendingFeedback = [
    { id: 1, title: "End Semester Course Feedback", target: "CS301 - Data Structures", deadline: "Oct 25, 2023" },
    { id: 2, title: "Faculty Evaluation", target: "Dr. Sarah Lee (CS302)", deadline: "Oct 25, 2023" }
  ];

  const myGrievances = [
    { id: "GRV-001", subject: "Hostel WiFi Connectivity Issue", date: "Oct 12, 2023", status: "IN_PROGRESS", category: "Infrastructure" },
    { id: "GRV-002", subject: "Library Fine Discrepancy", date: "Sep 28, 2023", status: "RESOLVED", category: "Library" }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Feedback & Support</h1>
        <p className="text-muted-foreground mt-1">Submit course feedback or raise a grievance.</p>
      </div>
      
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="feedback">Feedback Forms</TabsTrigger>
          <TabsTrigger value="grievances">My Grievances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingFeedback.map(form => (
              <Card key={form.id}>
                <CardHeader>
                  <CardTitle className="text-base">{form.title}</CardTitle>
                  <CardDescription>{form.target}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
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
          <div className="flex justify-end mb-6">
            <Button><Plus className="mr-2 h-4 w-4" /> Raise Grievance</Button>
          </div>
          
          <div className="space-y-4">
            {myGrievances.map(grievance => (
              <Card key={grievance.id}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">{grievance.id}</span>
                      <Badge variant="outline">{grievance.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{grievance.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Raised on: {grievance.date}</p>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Badge variant={grievance.status === "RESOLVED" ? "secondary" : "default"} className="px-3 py-1">
                      {grievance.status.replace("_", " ")}
                    </Badge>
                    <Button variant="outline" size="sm">View Details</Button>
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
