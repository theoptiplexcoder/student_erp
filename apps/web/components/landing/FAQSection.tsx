// @ts-nocheck
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How long does implementation take?",
    answer: "For most schools, full implementation and data migration takes between 2 to 4 weeks. Our dedicated success team will guide you through every step of the process."
  },
  {
    question: "Do you integrate with our existing accounting software?",
    answer: "Yes, Student ERP integrates with major accounting platforms including QuickBooks, Xero, and Sage. We also offer a robust API for custom integrations."
  },
  {
    question: "Is training provided for our faculty and staff?",
    answer: "Absolutely. All plans include access to our comprehensive video library. Growth and Enterprise plans include live, instructor-led onboarding sessions for your entire staff."
  },
  {
    question: "How secure is the student data?",
    answer: "We employ bank-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. We are fully compliant with FERPA, GDPR, and SOC2 Type II standards."
  },
  {
    question: "Can parents access the system?",
    answer: "Yes, we provide a dedicated Guardian portal and mobile app where parents can view attendance, grades, fee schedules, and communicate directly with teachers."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-card/30 relative">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-border bg-background rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                {React.createElement(ChevronDown as any, {
                  className: `size-5 text-muted-foreground transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`
                })}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground">
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
