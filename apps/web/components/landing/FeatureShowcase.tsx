'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  GraduationCap,
  CalendarClock,
  Award,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@student-erp/ui';

const capabilities = [
  {
    title: 'Admissions & Enrollment',
    description:
      'Digital application funnels, parent verification pipelines, auto USN generation, and document validation.',
    icon: Users,
    badge: 'Core Workflow',
  },
  {
    title: 'Attendance & Session Logs',
    description:
      'Daily and period-level tracking, real-time absence alerts, defaulter lists, and institutional analytics.',
    icon: ClipboardList,
    badge: 'Real-time',
  },
  {
    title: 'Timetable Scheduling',
    description:
      'Constraint-based course-to-room allocations, faculty conflict checks, and interactive weekly grid views.',
    icon: CalendarClock,
    badge: 'Automated',
  },
  {
    title: 'Examinations & Grading',
    description:
      'Exam schedule builders, hall ticket issuance, marks capture, SGPA/CGPA evaluation, and grade card printing.',
    icon: Award,
    badge: 'Academics',
  },
  {
    title: 'Fee Management & Accounts',
    description:
      'Custom fee structures, student payment schedules, automated receipts, online payments, and fee defaulter tracking.',
    icon: CreditCard,
    badge: 'Finance',
  },
  {
    title: 'Enterprise Role Security',
    description:
      'Granular permissions across Super Admins, Department Chairs, Faculty, Students, and Parents with complete audit logs.',
    icon: ShieldCheck,
    badge: 'Security',
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-muted/20 border-border/60 border-b py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="border-primary/20 bg-primary/5 text-primary mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Comprehensive ERP Modules
          </div>
          <h2 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Everything Your Institution Requires
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm sm:text-base">
            From direct admission onboarding to alumni transcripts, Student ERP brings every
            department into perfect synchronization.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="h-full"
            >
              <Card className="border-border/80 bg-card hover:border-primary/40 flex h-full flex-col justify-between transition-all duration-150 hover:shadow-xs">
                <CardHeader className="p-5 pb-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                      <cap.icon className="h-5 w-5" />
                    </div>
                    <span className="text-muted-foreground border-border/70 bg-muted/40 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                      {cap.badge}
                    </span>
                  </div>
                  <CardTitle className="text-base font-semibold">{cap.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-muted-foreground text-xs leading-relaxed">{cap.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
