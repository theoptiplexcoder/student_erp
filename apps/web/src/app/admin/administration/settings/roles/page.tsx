import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@student-erp/ui';

export default function RolesSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Configure RBAC roles and manage user permissions.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Define institution-level roles and map them to specific permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-border text-muted-foreground flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            Roles Configuration Component
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
