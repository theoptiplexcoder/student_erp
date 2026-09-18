'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, Users, BookOpen, UserCog } from 'lucide-react';
import { Card, CardContent } from '@student-erp/ui';

const personas = [
  {
    role: 'Institution Leadership',
    subtitle: 'Principal, Deans & Registrars',
    icon: UserCog,
    features: [
      'Multi-campus KPI dashboards',
      'Affiliation & accreditation reporting',
      'Financial fee collections oversight',
      'Institution policy & calendar control',
    ],
  },
  {
    role: 'Faculty & Teachers',
    subtitle: 'Professors & Course Instructors',
    icon: BookOpen,
    features: [
      'Interactive timetable & room view',
      'One-click attendance taking',
      'Continuous evaluation & gradebook',
      'Lesson plan & syllabus progress',
    ],
  },
  {
    role: 'Students & Learners',
    subtitle: 'Undergraduate & Graduate Cohorts',
    icon: GraduationCap,
    features: [
      'Real-time attendance percentages',
      'Examination hall tickets & results',
      'Digital fee receipts & dues status',
      'Grievances & certificates desk',
    ],
  },
  {
    role: 'Administrative Staff',
    subtitle: 'Admissions, Finance & HR',
    icon: Users,
    features: [
      'Bulk student data import/export',
      'USN allocation & identity cards',
      'Fee plan installment management',
      'Audit log monitoring & backups',
    ],
  },
];

export function PersonaSection() {
  return (
    <section id="personas" className="bg-background border-border/60 border-b py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Role-Dedicated Experiences
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm sm:text-base">
            Unlike one-size-fits-all software, each role receives a purpose-built workspace tailored
            to their daily objectives.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {personas.map((persona, i) => (
            <motion.div
              key={persona.role}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="h-full"
            >
              <Card className="border-border/80 bg-card hover:border-border flex h-full flex-col justify-between shadow-xs transition-colors">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="bg-muted text-foreground mb-4 flex h-10 w-10 items-center justify-center rounded-lg">
                    <persona.icon className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-foreground text-base font-bold">
                      {persona.role}
                    </h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">{persona.subtitle}</p>
                  </div>

                  <ul className="border-border/50 text-muted-foreground mt-5 flex-1 space-y-2 border-t pt-4 text-xs">
                    {persona.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
