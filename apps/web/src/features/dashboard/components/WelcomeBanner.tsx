import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';

export function WelcomeBanner() {
  return (
    <div className="bg-primary/5 border-primary/20 flex w-full flex-col items-start justify-between gap-4 rounded-2xl border p-6 md:flex-row md:items-center md:p-8">
      <div>
        <h1 className="font-display text-foreground mb-2 flex items-center gap-2 text-2xl font-bold md:text-3xl">
          Good morning, Administrator <Sparkles className="text-primary h-6 w-6" />
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Ellipsonic University · Main Campus
        </p>
      </div>

      <div className="bg-background border-border flex items-center gap-3 rounded-lg border px-4 py-2 shadow-sm">
        <div className="bg-muted rounded-md p-2">
          <Calendar className="text-primary h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Academic Year
          </span>
          <span className="text-sm font-semibold">2026 - 2027</span>
        </div>
      </div>
    </div>
  );
}
