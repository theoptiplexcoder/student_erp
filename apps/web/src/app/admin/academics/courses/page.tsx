import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@student-erp/ui"

export default function AcademicsCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage academic courses and curriculum.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Course Directory</CardTitle>
          <CardDescription>All courses offered by the institution.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg text-muted-foreground">
            Courses Table Component
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
