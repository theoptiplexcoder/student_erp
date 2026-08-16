'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Briefcase, Users, LayoutDashboard, LineChart, FileText } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="text-primary size-6" />,
    title: 'Sign Up',
    description: 'Create your account in seconds.',
  },
  {
    icon: <Briefcase className="text-primary size-6" />,
    title: 'Create Workspace',
    description: "Set up your institution's profile.",
  },
  {
    icon: <Users className="text-primary size-6" />,
    title: 'Invite Team',
    description: 'Onboard faculty and administrators.',
  },
  {
    icon: <LayoutDashboard className="text-primary size-6" />,
    title: 'Manage Projects',
    description: 'Organize academic workflows.',
  },
  {
    icon: <LineChart className="text-primary size-6" />,
    title: 'Track Progress',
    description: 'Monitor student and staff performance.',
  },
  {
    icon: <FileText className="text-primary size-6" />,
    title: 'Generate Reports',
    description: 'Export beautiful analytics.',
  },
];

export function WorkflowSection() {
  return (
    <section className="bg-card/30 relative overflow-hidden py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-16 text-center">
          <h2 className="font-display mb-4 text-4xl font-bold md:text-5xl">How It Works</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            A seamless journey from initial setup to running a fully digital institution.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connecting Line (desktop only) */}
          <div className="bg-border absolute top-[4.5rem] right-[10%] left-[10%] z-0 hidden h-[2px] md:block" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative z-10 flex flex-col items-center text-center"
            >
              <div className="bg-background border-border group-hover:border-primary/50 mb-6 flex size-16 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300 group-hover:shadow-md">
                {step.icon}
              </div>
              <h3 className="font-display mb-2 text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground max-w-[250px] text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
