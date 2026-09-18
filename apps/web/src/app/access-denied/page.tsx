import { Suspense } from 'react';
import Link from 'next/navigation';
import { AccessDeniedClient } from './access-denied-client';

export const dynamic = 'force-dynamic';

export default function AccessDeniedPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center p-4">Loading...</div>}
    >
      <AccessDeniedClient />
    </Suspense>
  );
}
