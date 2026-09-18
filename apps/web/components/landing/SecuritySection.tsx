'use client';

import React from 'react';
import { ShieldCheck, Lock, Activity, KeyRound, Server, FileSearch } from 'lucide-react';
import { Card, CardContent } from '@student-erp/ui';
import { motion } from 'framer-motion';

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Encryption',
    description: 'AES-256 for all stored academic documents and TLS 1.3 encryption in transit.',
  },
  {
    icon: KeyRound,
    title: 'Multi-Tenant Isolation',
    description: 'Complete data boundary segregation ensuring institutional data never overlaps.',
  },
  {
    icon: Lock,
    title: 'Role-Based Permissions (RBAC)',
    description:
      'Granular policy enforcement across faculty, administrators, students, and guardians.',
  },
  {
    icon: FileSearch,
    title: 'Immutable Audit Trail',
    description: 'Timestamped logging for grade changes, fee modifications, and profile edits.',
  },
  {
    icon: Server,
    title: 'Disaster Recovery & Backups',
    description:
      'Automated point-in-time recovery and geographically redundant database clustering.',
  },
  {
    icon: Activity,
    title: 'High Availability SLA',
    description:
      'Engineered for 99.99% uptime to withstand high-volume admissions and exam result peaks.',
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="bg-muted/20 border-border/60 border-b py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="space-y-4 lg:w-1/3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" /> Institutional Trust & Compliance
            </div>
            <h2 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Security Built For Educational Integrity
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Educational institutions hold highly sensitive identity, financial, and academic
              records. We adhere to rigorous compliance standards so your campus remains
              safeguarded.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-2/3 lg:grid-cols-3">
            {securityFeatures.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="border-border/80 bg-card h-full p-4 shadow-xs">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <feat.icon className="h-4 w-4" />
                    </div>
                    <h4 className="text-foreground text-xs font-semibold">{feat.title}</h4>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {feat.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
