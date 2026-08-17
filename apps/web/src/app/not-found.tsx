import Link from 'next/link';
import { Button } from '@student-erp/ui';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background flex h-screen w-full flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="bg-muted text-muted-foreground mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <FileQuestion className="h-10 w-10" />
        </div>
        <h1 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Page Not Found
        </h1>
        <p className="text-muted-foreground mt-4">
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
