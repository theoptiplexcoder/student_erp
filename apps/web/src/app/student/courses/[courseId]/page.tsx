import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@student-erp/ui";
import { enrolledCourses, upcomingDeadlines } from "@/lib/mock/student/data";
import { ArrowLeft, BookOpen, Clock, FileText, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@student-erp/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@student-erp/ui";
import { CourseAttendance } from "@/components/student/courses/attendance/CourseAttendance";

export default async function CourseWorkspace({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = enrolledCourses.find((c) => c.id === courseId) || enrolledCourses[0];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full pb-10">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/student/courses"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-3">
            <span>{course.code}</span>
            <span>•</span>
            <span className="flex items-center"><User className="h-3.5 w-3.5 mr-1" /> {course.faculty}</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0 h-auto">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Overview</TabsTrigger>
          <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Resources</TabsTrigger>
          <TabsTrigger value="assignments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Assignments</TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Attendance</TabsTrigger>
          <TabsTrigger value="grades" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">Grades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="py-6 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle>Course Information</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">This course introduces fundamental concepts and applications. By the end of this course, students will be able to apply these concepts in real-world scenarios.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle>Recent Announcements</CardTitle></CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  No recent announcements for this course.
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="font-medium">{course.attendance}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${course.attendance < 75 ? "bg-destructive" : "bg-green-500"}`} style={{ width: `${course.attendance}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="assignments" className="py-6 focus-visible:outline-none focus-visible:ring-0">
           <Card>
             <CardHeader><CardTitle>Assignments</CardTitle></CardHeader>
             <CardContent>
               {upcomingDeadlines.filter(d => d.course === course.code).length > 0 ? (
                 <div className="space-y-4">
                   {upcomingDeadlines.filter(d => d.course === course.code).map(assignment => (
                     <div key={assignment.id} className="flex justify-between items-center p-4 border rounded-lg">
                       <div>
                         <h4 className="font-medium">{assignment.title}</h4>
                         <div className="flex items-center text-xs text-muted-foreground mt-1">
                           <Clock className="h-3 w-3 mr-1" /> Due: {assignment.dueDate}
                         </div>
                       </div>
                       <Button size="sm" variant={assignment.status === "SUBMITTED" ? "outline" : "default"}>
                         {assignment.status === "SUBMITTED" ? "View Submission" : "Submit"}
                       </Button>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-muted-foreground text-sm text-center py-8">No assignments posted for this course yet.</p>
               )}
             </CardContent>
           </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="py-6 focus-visible:outline-none focus-visible:ring-0">
          <CourseAttendance courseId={courseId} />
        </TabsContent>
        
        {/* Other tabs would follow similar patterns */}
      </Tabs>
    </div>
  );
}
