import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@student-erp/ui"

export default function ExaminationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Examinations</h1>
          <p className="text-muted-foreground mt-1">Manage institutional exams, timetables, and invigilation.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Exams</CardTitle>
          <CardDescription>Examinations scheduled across all programs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg text-muted-foreground">
            Exams List Component
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
