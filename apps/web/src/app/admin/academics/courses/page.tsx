import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@student-erp/ui";
import { Plus, Eye, Edit } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getCourses() {
  try {
    const res = await fetch(`${API_URL}/api/admin/courses`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Failed to fetch courses", e);
    return [];
  }
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">Manage academic courses and curriculum.</p>
        </div>
        <Link href="/admin/academics/courses/new">
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
          {courses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No courses found. Add a course to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course: any) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.creditValue}</TableCell>
                    <TableCell>{course.program?.name || "-"}</TableCell>
                    <TableCell>{course.department?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === "ACTIVE" ? "default" : "secondary"}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/academics/courses/${course.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/academics/courses/${course.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
