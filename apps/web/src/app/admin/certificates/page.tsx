import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@student-erp/ui"

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground mt-1">Generate and verify institutional certificates.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Certificate Requests</CardTitle>
          <CardDescription>Pending requests for transcripts, degree certificates, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg text-muted-foreground">
            Certificates Management Component
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
