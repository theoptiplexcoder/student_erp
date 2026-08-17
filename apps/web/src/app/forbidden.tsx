import Link from 'next/link';
import { Button } from '@student-erp/ui';
import { AlertTriangle } from 'lucide-react';

export default function Forbidden() {
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
          You do not have permission to view this page or perform this action. If you believe this
          is a mistake, please contact your administrator.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Switch Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
