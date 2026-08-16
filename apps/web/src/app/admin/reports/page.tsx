import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@student-erp/ui';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Institutional analytics and compliance reports.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Visual summaries of institutional performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            Reports & Charts Component
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
