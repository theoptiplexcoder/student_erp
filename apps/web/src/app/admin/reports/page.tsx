import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@student-erp/ui"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Institutional analytics and compliance reports.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Visual summaries of institutional performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg text-muted-foreground">
            Reports & Charts Component
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
