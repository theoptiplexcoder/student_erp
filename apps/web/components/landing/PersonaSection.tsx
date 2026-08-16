'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserCog, BookUser, GraduationCap, Users } from 'lucide-react';
import { Card, CardContent } from '@student-erp/ui';

const personas = [
  {
    role: 'Institution Administrator',
    icon: <UserCog className="text-primary size-8" />,
    responsibilities: ['Multi-campus management', 'Financial overview', 'Policy enforcement'],
    stats: '100+ Reports',
  },
  {
    role: 'Faculty Member',
    icon: <BookUser className="text-chart-2 size-8" />,
    responsibilities: ['Curriculum delivery', 'Grading & Attendance', 'Student mentorship'],
    stats: 'Automated Grading',
  },
  {
    role: 'Student',
    icon: <GraduationCap className="text-chart-4 size-8" />,
    responsibilities: ['Course enrollment', 'Assignment submission', 'Peer collaboration'],
    stats: 'Mobile App Access',
  },
  {
    role: 'Guardian',
    icon: <Users className="text-chart-1 size-8" />,
    responsibilities: ['Performance monitoring', 'Fee payment', 'Direct communication'],
    stats: 'Real-time Alerts',
  },
];

export function PersonaSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="bg-chart-2/10 absolute top-1/2 left-0 -z-10 h-96 w-96 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="bg-primary/10 absolute top-1/2 right-0 -z-10 h-96 w-96 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-display mb-6 text-4xl font-bold md:text-5xl">Built for Every User</h2>
          <p className="text-muted-foreground text-lg">
            Dedicated workspaces tailored specifically for the unique needs of each role in your
            institution.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {personas.map((persona, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card/50 border-border hover:border-primary/50 h-full backdrop-blur-sm transition-colors">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-6">{persona.icon}</div>
                  <h3 className="font-display mb-4 text-xl font-bold">{persona.role}</h3>
                  <ul className="mb-8 flex-1 space-y-2">
                    {persona.responsibilities.map((req, j) => (
                      <li key={j} className="text-muted-foreground flex items-start gap-2 text-sm">
                        <span className="text-primary mt-0.5">•</span> {req}
                      </li>
                    ))}
                  </ul>
                  <div className="border-border mt-auto border-t pt-4">
                    <span className="text-foreground text-sm font-medium">{persona.stats}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
