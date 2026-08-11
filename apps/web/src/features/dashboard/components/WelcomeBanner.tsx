import React from "react";
import { Sparkles, Calendar } from "lucide-react";

export function WelcomeBanner() {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2 mb-2">
          Good morning, Administrator <Sparkles className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Ellipsonic University · Main Campus
        </p>
      </div>
      
      <div className="flex items-center gap-3 bg-background border border-border px-4 py-2 rounded-lg shadow-sm">
        <div className="bg-muted p-2 rounded-md">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Academic Year</span>
          <span className="text-sm font-semibold">2026 - 2027</span>
        </div>
      </div>
    </div>
  );
}
