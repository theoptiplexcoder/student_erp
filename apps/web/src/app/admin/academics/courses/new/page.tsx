import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@student-erp/ui";
import { requireAuth } from "@/lib/auth";
import { NewCourseForm } from "@/components/admin/courses/NewCourseForm";
import { redirect } from "next/navigation";

export default async function NewCoursePage() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    redirect("/login");
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
        <p className="text-muted-foreground">Add a new academic course to the system.</p>
      </div>

      <NewCourseForm institutionId={user.institutionId} />
    </div>
  );
}
