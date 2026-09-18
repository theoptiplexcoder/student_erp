'use client';

import React from 'react';
import { Button } from '@student-erp/ui';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="from-background to-muted/40 border-border/60 relative overflow-hidden border-b bg-gradient-to-b py-20 sm:py-28">
      <div className="relative z-10 container mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="border-primary/20 bg-primary/5 text-primary mb-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" /> Modernize Campus Operations Today
        </div>

        <h2 className="font-display text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
          Ready to Elevate Your Institution's Standard?
        </h2>

        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base md:text-lg">
          Join institutions already providing seamless digital academic experiences for faculty,
          administrators, and students.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-11 w-full gap-2 px-6 font-semibold shadow-xs sm:w-auto"
          >
            <Link href="/signup">
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border/80 h-11 w-full px-6 font-semibold sm:w-auto"
          >
            <Link href="/login">Sign In to Your Campus</Link>
          </Button>
        </div>

        <div className="text-muted-foreground mt-8 flex items-center justify-center gap-2 text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>No credit card required • Fully guided onboarding</span>
        </div>
      </div>
    </section>
  );
}
