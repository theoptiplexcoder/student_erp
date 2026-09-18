'use client';

import React from 'react';
import { Button } from '@student-erp/ui';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Building2,
  Users,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="border-border/60 from-muted/30 via-background to-background relative isolate overflow-hidden border-b bg-gradient-to-b pt-28 pb-20 md:pt-36 md:pb-24">
      {/* Subtle background grid inspired by GitHub / Stripe */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem]" />

      {/* Soft restrained primary glow */}
      <div className="bg-primary/10 pointer-events-none absolute top-12 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-70 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Release Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="border-primary/20 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Generation Institutional Intelligence</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground font-normal">v2.4 Enterprise Release</span>
          </motion.div>

          {/* Value Proposition Header */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-foreground text-4xl leading-[1.12] font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Unified Academic Operations for Modern Institutions.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mt-6 max-w-2xl text-base leading-relaxed text-balance sm:text-lg md:text-xl"
          >
            The enterprise ERP built for schools, colleges, and university campuses. Streamline
            admissions, student lifecycles, attendance, timetables, and examinations in one reliable
            workspace.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="h-11 w-full gap-2 px-6 text-sm font-semibold shadow-xs sm:w-auto"
            >
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border/80 h-11 w-full px-6 text-sm font-semibold sm:w-auto"
            >
              <Link href="/login">Explore Demo Instance</Link>
            </Button>
          </motion.div>

          {/* Enterprise Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="border-border/60 text-muted-foreground mt-12 flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t pt-8 text-xs font-medium"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>FERPA & SOC-2 Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="text-primary h-4 w-4" />
              <span>Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>99.99% Guaranteed SLA</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
