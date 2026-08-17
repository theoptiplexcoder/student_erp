import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="bg-background flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
