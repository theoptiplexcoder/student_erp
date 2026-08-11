import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@student-erp/ui";
import { EnrollStudentDialog } from "@/components/admin/courses/EnrollStudentDialog";
import { Users } from "lucide-react";

export default function CourseOfferingDetailsPage({ params }: { params: { offeringId: string } }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Management Systems - Section A</h1>
          <p className="text-muted-foreground">CS301 • Semester 3 • 2026-27</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Edit Offering</Button>
          <Button variant="outline">Assign Faculty</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Offering Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Program</span>
              <span>B.Tech CSE</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Batch</span>
              <span>2025</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Primary Faculty</span>
              <span>Prof. Rahul</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold text-muted-foreground">Capacity</span>
              <span>42 / 60 Enrolled</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>Manage students in this course offering</CardDescription>
            </div>
            <EnrollStudentDialog offeringId={params.offeringId} />
          </CardHeader>
          <CardContent>
            <div className="border rounded-md text-sm text-center py-10 text-muted-foreground flex flex-col items-center">
              <Users className="h-10 w-10 mb-2 opacity-20" />
              <p>42 students are currently enrolled.</p>
              <p>Table component will be rendered here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
