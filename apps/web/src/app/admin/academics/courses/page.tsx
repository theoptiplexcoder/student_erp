import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@student-erp/ui";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage academic courses and curriculum.</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>View and manage all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            No courses found. Add a course to get started.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
