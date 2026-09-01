import React from 'react';
import { Badge } from '@student-erp/ui';

export function TimetableStatusBadge({
  status,
}: {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
}) {
  const variantMap: Record<string, 'secondary' | 'default' | 'outline'> = {
    DRAFT: 'secondary',
    PUBLISHED: 'default',
    ARCHIVED: 'outline',
  };

  return <Badge variant={variantMap[status] || 'secondary'}>{status}</Badge>;
}
