'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, Avatar, AvatarFallback, AvatarImage } from '@student-erp/ui';

const testimonials = [
  {
    name: 'Dr. Sarah Jenkins',
    role: 'Dean of Admissions',
    institution: 'Westwood University',
    text: 'Student ERP completely revolutionized how we handle incoming applications. Our processing time dropped by 60%, and the student experience is seamless.',
    image: 'https://i.pravatar.cc/150?img=47',
  },
  {
    name: 'Prof. Michael Chang',
    role: 'Head of Computer Science',
    institution: 'Tech Institute of America',
    text: 'The integration between course management and grading is flawless. I spend less time doing administrative work and more time actually teaching.',
    image: 'https://i.pravatar.cc/150?img=11',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Registrar',
    institution: 'Global Arts College',
    text: 'We used to dread registration week. With this platform, it handles thousands of concurrent users without a hiccup. Truly enterprise-grade.',
    image: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'James Wilson',
    role: 'IT Director',
    institution: 'National Public Schools',
    text: "The AI-ready architecture and robust APIs allowed us to connect our legacy systems easily. The rollout was the smoothest I've seen in my 20-year career.",
    image: 'https://i.pravatar.cc/150?img=33',
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/30 relative py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display mb-6 text-4xl font-bold md:text-5xl"
          >
            Trusted by the Best
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            See how forward-thinking institutions are transforming their campus operations with our
            platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="bg-card border-border/50 flex h-full flex-col justify-between p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
                <div>
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="fill-primary text-primary size-4" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-6 text-sm leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="border-primary/20 h-10 w-10 border">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-display text-sm font-bold">{testimonial.name}</h4>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
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
