'use client';

import React from 'react';
import { Button } from '@student-erp/ui';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="bg-primary text-primary-foreground relative overflow-hidden py-32">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px] opacity-10" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="font-display mx-auto mb-8 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
          Ready to Modernize Your Institution?
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-xl opacity-90 md:text-2xl">
          Join 500+ institutions already using Student ERP to transform their academic operations.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="xl"
            className="text-primary w-full bg-white transition-transform hover:-translate-y-1 hover:bg-white/90 sm:w-auto"
          >
            Sign Up
            <ArrowRight className="ml-2 size-5" />
          </Button>
          <Button
            size="xl"
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 sm:w-auto"
          >
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
}
