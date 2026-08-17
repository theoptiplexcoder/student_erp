'use client';

import React from 'react';
import { Card } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Plus } from 'lucide-react';

export default function ForumsPage() {
  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Academic Forums</h1>
          <p className="text-muted-foreground mt-1">
            Discuss course topics and find project partners.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" /> New Discussion
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="text-muted-foreground p-10 text-center">
          Forums feature is currently under development.
        </Card>
      </div>
    </div>
  );
}
