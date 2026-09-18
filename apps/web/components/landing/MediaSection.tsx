'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  LayoutDashboard,
  Search,
  Building2,
} from 'lucide-react';

export function MediaSection() {
  return (
    <section id="preview" className="bg-background relative overflow-hidden py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Engineered for Precision and High Density
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Clean, distraction-free software designed to handle tens of thousands of student records
            without visual fatigue.
          </p>
        </div>

        {/* Browser Shell Mockup showing modern ERP UI */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="border-border/80 bg-card mx-auto max-w-5xl overflow-hidden rounded-xl border shadow-xl"
        >
          {/* Mock Browser Titlebar */}
          <div className="border-border/70 bg-muted/50 flex items-center justify-between border-b px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-amber-400/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="border-border/60 bg-background text-muted-foreground flex w-72 items-center justify-center gap-2 rounded-md border px-3 py-1 font-mono text-[11px]">
              <span className="text-emerald-500">https://</span>
              <span>app.studenterp.io/admin/dashboard</span>
            </div>
            <div className="w-10" />
          </div>

          {/* Interactive Mockup Body */}
          <div className="bg-background/50 space-y-6 p-4 sm:p-6">
            {/* Top Bar Preview */}
            <div className="border-border/60 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
              <div>
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                  Academic Session 2026–2027
                </span>
                <h3 className="font-display text-foreground text-xl font-bold">
                  Institutional Command Center
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> System Operational
                </span>
              </div>
            </div>

            {/* KPI Metric Strips */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="border-border/80 bg-card rounded-lg border p-3.5 shadow-xs">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Active Students
                </p>
                <p className="text-foreground font-display mt-1 text-xl font-bold">2,482</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>+4.2% this term</span>
                </div>
              </div>

              <div className="border-border/80 bg-card rounded-lg border p-3.5 shadow-xs">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Faculty Roster
                </p>
                <p className="text-foreground font-display mt-1 text-xl font-bold">168</p>
                <p className="text-muted-foreground mt-1 text-[11px]">12 Departments</p>
              </div>

              <div className="border-border/80 bg-card rounded-lg border p-3.5 shadow-xs">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Attendance Rate
                </p>
                <p className="text-foreground font-display mt-1 text-xl font-bold">94.8%</p>
                <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Above 85% goal
                </p>
              </div>

              <div className="border-border/80 bg-card rounded-lg border p-3.5 shadow-xs">
                <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  Admissions Queue
                </p>
                <p className="text-foreground font-display mt-1 text-xl font-bold">38</p>
                <p className="mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  12 pending review
                </p>
              </div>
            </div>

            {/* Table Mockup */}
            <div className="border-border/80 bg-card overflow-hidden rounded-lg border shadow-xs">
              <div className="border-border/60 bg-muted/30 flex items-center justify-between border-b px-4 py-3">
                <span className="text-foreground text-xs font-semibold">
                  Recent Student Enrollment Queue
                </span>
                <span className="text-muted-foreground text-[11px]">Showing latest 3 of 2,482</span>
              </div>
              <div className="divide-border/50 divide-y text-xs">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold">
                      RS
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">Rahul Sharma</p>
                      <p className="text-muted-foreground font-mono text-[10px]">STU-2026-00124</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground hidden sm:block">
                    Computer Science (10-A)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    Enrolled
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold">
                      AR
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">Ananya Rao</p>
                      <p className="text-muted-foreground font-mono text-[10px]">STU-2026-00125</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground hidden sm:block">
                    Electronics & Comm. (10-B)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    Enrolled
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-600">
                      AK
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">Arjun Kumar</p>
                      <p className="text-muted-foreground font-mono text-[10px]">STU-2026-00126</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground hidden sm:block">
                    Mechanical Eng. (9-A)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    Application Pending
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
