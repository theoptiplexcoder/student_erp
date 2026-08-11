import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@student-erp/ui";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Management Systems</h1>
          <p className="text-muted-foreground">CS301 • 4.0 Credits • B.Tech Computer Science</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Edit Course</Button>
          <Link href={`/admin/courses/${courseId}/offerings/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Offering
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Code</span>
              <span>CS301</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Department</span>
              <span>Computer Science</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Status</span>
              <span className="text-green-600">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Offerings</CardTitle>
            <CardDescription>Instances where this course is currently taught</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-md p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">2026-27 • Semester 3</h4>
                  <p className="text-sm text-muted-foreground">Section A • Prof. Rahul</p>
                </div>
                <Link href={`/admin/courses/offerings/123`}>
                  <Button variant="secondary" size="sm">Manage</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
