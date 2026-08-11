import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@student-erp/ui";
import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";

async function getCourse(id: string) {
  try {
    const res = await fetch(`http://localhost:3001/api/admin/courses/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch course");
    }
    return res.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground">{course.code} • {course.creditValue} Credits • {course.program?.name || "No Program"}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Edit Course</Button>
          <Link href={`/admin/academics/courses/offerings/new?courseId=${courseId}`}>
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
              <span>{course.code}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Department</span>
              <span>{course.department?.name || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Status</span>
              <Badge variant={course.status === 'ACTIVE' ? 'default' : 'secondary'}>{course.status}</Badge>
            </div>
            {course.description && (
              <div className="flex justify-between pt-2">
                <span className="font-semibold">Description</span>
                <span className="text-muted-foreground text-right w-2/3">{course.description}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Offerings</CardTitle>
            <CardDescription>Instances where this course is currently taught</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {course.courseOfferings?.length > 0 ? (
                course.courseOfferings.map((offering: any) => (
                  <div key={offering.id} className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{offering.term?.name || "Unknown Term"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {offering.section ? `Section ${offering.section.name}` : "No Section"}
                        {offering.enrollments?.length > 0 ? ` • ${offering.enrollments.length} Enrolled` : " • 0 Enrolled"}
                      </p>
                    </div>
                    <Link href={`/admin/academics/courses/offerings/${offering.id}`}>
                      <Button variant="secondary" size="sm">Manage</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-2 text-muted-foreground py-4">
                  <AlertCircle className="h-4 w-4" />
                  <span>No active offerings for this course.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
