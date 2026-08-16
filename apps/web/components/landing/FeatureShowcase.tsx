'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@student-erp/ui';

const features = [
  {
    title: 'Student Lifecycle',
    description:
      'Applicant → Admission → Enrollment → Graduation → Alumni. Manage everything seamlessly.',
    icon: <Users className="text-primary size-6" />,
  },
  {
    title: 'Faculty & Academics',
    description:
      'Curriculum planning, examinations, grading, and attendance tracking made effortless.',
    icon: <BookOpen className="text-chart-1 size-6" />,
  },
  {
    title: 'Administration',
    description: 'Fee management, payroll, HR, and compliance built for large institutions.',
    icon: <Building2 className="text-chart-2 size-6" />,
  },
  {
    title: 'Certificates & Alumni',
    description: 'Automated digital certificate generation and alumni engagement portals.',
    icon: <GraduationCap className="text-chart-3 size-6" />,
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, role-based access control, and comprehensive audit logs.',
    icon: <Building2 className="text-primary size-6" />,
  },
  {
    title: 'Seamless Integrations',
    description: 'Connect with your existing tools: LMS, Payment Gateways, and Communication APIs.',
    icon: <BookOpen className="text-chart-1 size-6" />,
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display mb-6 text-4xl font-bold md:text-5xl"
          >
            Built for Modern Education
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            A modular, comprehensive platform designed to handle the complexity of modern
            institutions.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-32 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-background border-border hover:border-primary/50 group h-full cursor-default">
                <CardHeader>
                  <div className="bg-muted/50 mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm md:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Alternating Layout 1 */}
        <div className="mb-24 flex flex-col items-center gap-16 lg:flex-row">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display mb-4 text-3xl font-bold">Real-time Student Analytics</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Empower faculty and guardians with real-time insights into student attendance,
              performance, and behavior. Identify trends before they become issues.
            </p>
            <ul className="space-y-3">
              {[
                'Predictive performance tracking',
                'Automated guardian alerts',
                'Comprehensive transcript generation',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-sm">
                    ✓
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            className="w-full flex-1"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-card border-border flex aspect-video flex-col gap-4 rounded-2xl border p-6 shadow-xl">
              <div className="bg-muted mb-4 h-8 w-1/3 rounded" />
              <div className="flex h-32 gap-4">
                <div className="bg-chart-1/20 flex flex-1 items-end justify-center rounded-lg pb-4">
                  <div className="bg-chart-1 h-24 w-12 rounded-t-sm" />
                </div>
                <div className="bg-chart-2/20 flex flex-1 items-end justify-center rounded-lg pb-4">
                  <div className="bg-chart-2 h-16 w-12 rounded-t-sm" />
                </div>
                <div className="bg-chart-3/20 flex flex-1 items-end justify-center rounded-lg pb-4">
                  <div className="bg-chart-3 h-20 w-12 rounded-t-sm" />
                </div>
              </div>
              <div className="bg-muted/50 mt-auto h-4 w-full rounded" />
            </div>
          </motion.div>
        </div>

        {/* Alternating Layout 2 */}
        <div className="flex flex-col-reverse items-center gap-16 lg:flex-row">
          <motion.div
            className="w-full flex-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-card border-border flex aspect-video flex-col gap-2 rounded-2xl border p-6 shadow-xl">
              <div className="border-border mb-4 flex gap-2 border-b pb-4">
                <div className="bg-primary/20 h-6 w-24 rounded" />
                <div className="bg-muted h-6 w-24 rounded" />
                <div className="bg-muted h-6 w-24 rounded" />
              </div>
              <div className="bg-muted/40 flex h-10 w-full items-center rounded px-4">
                <div className="bg-muted h-4 w-1/2 rounded" />
              </div>
              <div className="bg-muted/40 flex h-10 w-full items-center rounded px-4">
                <div className="bg-muted h-4 w-3/4 rounded" />
              </div>
              <div className="bg-muted/40 flex h-10 w-full items-center rounded px-4">
                <div className="bg-muted h-4 w-2/3 rounded" />
              </div>
            </div>
          </motion.div>
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display mb-4 text-3xl font-bold">Seamless Administration</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              From admissions to fee collection, automate your entire back-office operations. Reduce
              manual errors and save hundreds of hours per semester.
            </p>
            <ul className="space-y-3">
              {[
                'Multi-campus management',
                'Role-based access control (RBAC)',
                'Enterprise-grade audit logs',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-chart-1/10 text-chart-1 flex h-6 w-6 items-center justify-center rounded-full text-sm">
                    ✓
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
