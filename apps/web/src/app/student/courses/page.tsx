import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@student-erp/ui";
import { enrolledCourses } from "@/lib/mock/student/data";
import { BookOpen, User, ArrowRight } from "lucide-react";
import { Button } from "@student-erp/ui";
import Link from "next/link";

export default function MyCoursesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">Overview of all your enrolled courses.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
            <div className={`h-2 ${course.color || "bg-primary"}`} />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mt-1">{course.code}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  {course.faculty}
                </div>
                <div className="flex items-center text-muted-foreground">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {course.credits} Credits
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-medium">{course.attendance}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${course.attendance < 75 ? "bg-destructive" : "bg-green-500"}`} 
                      style={{ width: `${course.attendance}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 border-t px-6 pt-4">
              <Button variant="ghost" className="w-full justify-between" asChild>
                <Link href={`/student/courses/${course.id}`}>
                  Open Course <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
