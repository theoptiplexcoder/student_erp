import React from 'react';
import { Badge } from '@student-erp/ui';

export function TimetableStatusBadge({ status }: { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }) {
  const variantMap = {
    DRAFT: 'secondary',
    PUBLISHED: 'default',
    ARCHIVED: 'outline',
  } as const;

  return <Badge variant={variantMap[status] || 'secondary'}>{status}</Badge>;
}
