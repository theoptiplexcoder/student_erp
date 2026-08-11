import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@student-erp/ui";
import { NewCourseForm } from "@/components/admin/courses/NewCourseForm";

const INSTITUTION_ID = "d9b97b0a-0b2a-4a8f-b9f1-7c980d2215c2";

export default function NewCoursePage() {
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
        <p className="text-muted-foreground">Add a new academic course to the system.</p>
      </div>

      <NewCourseForm institutionId={INSTITUTION_ID} />
    </div>
  );
}
