import Link from 'next/link';
import { Button } from '@student-erp/ui';
import { Lock } from 'lucide-react';

export default function Unauthorized() {
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
