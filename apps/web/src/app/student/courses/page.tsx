import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@student-erp/ui';
import { enrolledCourses } from '@/lib/mock/student/data';
import { BookOpen, User, ArrowRight } from 'lucide-react';
import { Button } from '@student-erp/ui';
import Link from 'next/link';

export default function MyCoursesPage() {
  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground mt-1">Overview of all your enrolled courses.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {enrolledCourses.map((course) => (
          <Card
            key={course.id}
            className="flex flex-col overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className={`h-2 ${course.color || 'bg-primary'}`} />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
              </div>
              <p className="text-muted-foreground mt-1 text-xs font-semibold">{course.code}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4 text-sm">
                <div className="text-muted-foreground flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {course.faculty}
                </div>
                <div className="text-muted-foreground flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {course.credits} Credits
                </div>

                <div className="pt-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="font-medium">{course.attendance}%</span>
                  </div>
                  <div className="bg-muted h-1.5 w-full rounded-full">
                    <div
                      className={`h-1.5 rounded-full ${course.attendance < 75 ? 'bg-destructive' : 'bg-green-500'}`}
                      style={{ width: `${course.attendance}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 pt-0 pt-4 pb-4">
              <Button variant="ghost" className="w-full justify-between" asChild>
                <Link href={`/student/courses/${course.id}`}>
                  Open Course <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
