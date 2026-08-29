'use client';

import { use } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function RoleDetailsPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = use(params);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/administration/roles">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manage Role Permissions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions for Role ID: {roleId}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground space-y-4 py-10 text-center">
            <ShieldCheck className="text-primary/50 mx-auto h-12 w-12" />
            <p>Permission management interface will go here.</p>
            <p className="text-sm">
              This would list out accessible modules (e.g., Admissions, Finance, Faculty) and allow
              the admin to toggle Read/Write/Delete access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
