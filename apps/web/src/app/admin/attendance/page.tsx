import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@student-erp/ui"

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Attendance Monitor</h1>
          <p className="text-muted-foreground mt-1">Institution-wide attendance monitoring and defaulter tracking.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Overall attendance trends across programs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg text-muted-foreground">
            Attendance Analytics Component
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
