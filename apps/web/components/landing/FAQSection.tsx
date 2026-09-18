'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How quickly can our institution migrate existing student data?',
    answer:
      'Most schools and colleges complete initial data import (students, courses, faculty, and historical marks) within 5 to 7 business days using our structured CSV/Excel onboarding pipelines and dedicated support specialists.',
  },
  {
    question: 'Does Student ERP support custom grading schemes and SGPA/CGPA formulas?',
    answer:
      'Yes. You can configure absolute or relative grading curves, credit distributions, prerequisite structures, and customizable semester grade sheets according to your regional regulatory board guidelines.',
  },
  {
    question: 'Can faculty record attendance and marks directly from mobile browsers?',
    answer:
      'Yes, the interface is fully responsive across desktop, tablet, and mobile displays. Instructors can mark session attendance and enter internal marks in seconds from any smartphone.',
  },
  {
    question: 'How is student data privacy protected under applicable regulations?',
    answer:
      'We enforce AES-256 database encryption at rest, TLS 1.3 in flight, multi-tenant database isolation, and role-based access control complying with global privacy frameworks (FERPA and GDPR).',
  },
  {
    question: 'Can parents receive automatic alerts for student attendance shortages?',
    answer:
      'Yes. Administrators can define custom attendance thresholds (e.g., below 75%) that automatically flag students in the triage dashboard and trigger notifications.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background border-border/60 border-b py-20 sm:py-28">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-14 text-center">
          <div className="border-border/80 bg-muted/40 text-muted-foreground mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
            <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Clear Answers to Common Questions
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Everything you need to know about implementing Student ERP on your campus.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-border/80 bg-card overflow-hidden rounded-lg border shadow-xs transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="hover:bg-muted/30 focus-visible:ring-primary flex w-full items-center justify-between p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none sm:p-5"
              >
                <span className="text-foreground text-sm font-semibold">{faq.question}</span>
                <ChevronDown
                  className={`text-muted-foreground ml-4 h-4 w-4 shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'text-primary rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-muted-foreground border-border/40 border-t px-4 pt-3 pb-4 text-xs leading-relaxed sm:px-5 sm:pb-5 sm:text-sm">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
