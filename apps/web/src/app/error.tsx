'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@student-erp/ui';
import { AlertCircle, Lock, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isForbidden =
    error.message?.includes('FORBIDDEN') || error.message?.toLowerCase().includes('forbidden');
  const isUnauthorized =
    error.message?.includes('UNAUTHORIZED') ||
    error.message?.toLowerCase().includes('unauthorized');

  if (isForbidden) {
    return (
      <div className="bg-background flex h-screen w-full flex-col items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="bg-destructive/10 text-destructive mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Access Denied
          </h1>
          <p className="text-muted-foreground mt-4">
            You do not have permission to view this page or perform this action.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild variant="outline">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="bg-background flex h-screen w-full flex-col items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="bg-muted text-muted-foreground mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <Lock className="h-10 w-10" />
          </div>
          <h1 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Authentication Required
          </h1>
          <p className="text-muted-foreground mt-4">
            You need to be logged in to access this page. Your session might have expired.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen w-full flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="bg-destructive/10 text-destructive mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mt-4">
          An unexpected error occurred. We've been notified and are looking into it.
        </p>
        <div className="mt-8 flex gap-4">
          <Button variant="outline" onClick={() => reset()}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
