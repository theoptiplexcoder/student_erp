import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@student-erp/ui';

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground mt-1">
            Generate and verify institutional certificates.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Requests</CardTitle>
          <CardDescription>
            Pending requests for transcripts, degree certificates, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            Certificates Management Component
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
