import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@student-erp/ui';
import { Plus } from 'lucide-react';

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Publish institution-wide communications and alerts.
          </p>
        </div>
        <Button className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Create Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Manage active and scheduled announcements.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            Announcements List Component
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
