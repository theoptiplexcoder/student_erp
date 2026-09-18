'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, Avatar, AvatarFallback, AvatarImage } from '@student-erp/ui';

const testimonials = [
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Dean of Academic Affairs',
    institution: 'St. Xavier Institute of Technology',
    text: 'Student ERP modernized our enrollment process. Verifying admissions and calculating term grades used to take weeks of spreadsheet juggling; now it is completely automated.',
    image: 'https://i.pravatar.cc/150?img=47',
  },
  {
    name: 'Prof. Michael Chang',
    role: 'Head of Computer Science',
    institution: 'Apex University',
    text: 'The timetable scheduling engine solved our faculty clash problems instantly. Our teaching staff love the clean daily schedule and attendance taking views.',
    image: 'https://i.pravatar.cc/150?img=11',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Registrar',
    institution: 'Metropolitan College',
    text: 'Handling over 6,000 student records during semester registration without a single hiccup is testament to the architectural quality of this ERP.',
    image: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'James Wilson',
    role: 'Director of Operations',
    institution: 'Oakridge International Schools',
    text: 'The role-based permission system gives each department exactly what they need while safeguarding sensitive student transcripts and fee dues.',
    image: 'https://i.pravatar.cc/150?img=33',
  },
];

export function Testimonials() {
  return (
    <section className="bg-background border-border/60 border-b py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by Academic Leaders
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Real feedback from deans, registrars, and department chairs managing high-volume
            campuses.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="h-full"
            >
              <Card className="border-border/80 bg-card hover:border-border flex h-full flex-col justify-between p-5 shadow-xs transition-colors">
                <div>
                  <div className="mb-3 flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed italic">"{t.text}"</p>
                </div>

                <div className="border-border/50 mt-5 flex items-center gap-3 border-t pt-4">
                  <Avatar className="border-border/80 h-8 w-8 shrink-0 border">
                    <AvatarImage src={t.image} alt={t.name} />
                    <AvatarFallback>{t.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h4 className="text-foreground truncate text-xs font-semibold">{t.name}</h4>
                    <p className="text-muted-foreground truncate text-[11px]">{t.role}</p>
                    <p className="text-muted-foreground/80 truncate text-[10px]">{t.institution}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
