import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@student-erp/ui"

export default function AdmissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Admissions</h1>
          <p className="text-muted-foreground mt-1">Review and process student applications.</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applications Overview</CardTitle>
            <CardDescription>Pipeline of current admission applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg text-muted-foreground">
              Applications Workflow Component
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
