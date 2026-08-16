'use client';

import React from 'react';
import { ShieldCheck, Lock, Activity, KeyRound, Server, FileSearch } from 'lucide-react';
import { Card, CardContent } from '@student-erp/ui';
import { motion } from 'framer-motion';

const securityFeatures = [
  {
    icon: <ShieldCheck className="size-6 text-emerald-500" />,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption for all data at rest and in transit.',
  },
  {
    icon: <KeyRound className="size-6 text-emerald-500" />,
    title: 'Single Sign-On (SSO)',
    description: 'Integrate with SAML, OAuth, and Active Directory.',
  },
  {
    icon: <Lock className="size-6 text-emerald-500" />,
    title: 'Role-Based Access',
    description: 'Granular permission controls for every user type.',
  },
  {
    icon: <FileSearch className="size-6 text-emerald-500" />,
    title: 'Audit Logs',
    description: 'Comprehensive tracking of all system modifications.',
  },
  {
    icon: <Server className="size-6 text-emerald-500" />,
    title: 'Compliance',
    description: 'Built to meet FERPA, GDPR, and SOC2 standards.',
  },
  {
    icon: <Activity className="size-6 text-emerald-500" />,
    title: '99.99% Uptime',
    description: 'Highly available infrastructure with global edge routing.',
  },
];

export function SecuritySection() {
  return (
    <section className="bg-card/10 relative overflow-hidden py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="lg:w-1/3">
            <h2 className="font-display mb-6 text-3xl font-bold md:text-5xl">
              Enterprise Grade. By Default.
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              We take the security of your institution's data seriously. Our infrastructure is built
              from the ground up to protect student privacy and ensure compliance at scale.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
              SOC2 Type II Certified
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-2/3">
            {securityFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-background border-border/50 hover:border-border h-full transition-colors">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                      {feature.icon}
                    </div>
                    <h4 className="font-display mb-2 font-bold">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
