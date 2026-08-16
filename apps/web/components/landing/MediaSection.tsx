'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function MediaSection() {
  return (
    <section className="bg-background relative overflow-hidden py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="border-border/50 bg-muted/20 relative mx-auto w-full max-w-6xl rounded-3xl border p-2 shadow-2xl"
          >
            {/* Background Glow */}
            <div className="bg-primary/20 absolute top-1/2 left-1/2 -z-10 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

            <div className="bg-card relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              {/* Note: since landing1.svg is in public/, it can be referenced at /landing1.svg */}
              <Image
                src="/landing1.svg"
                alt="Student ERP Dashboard Demonstration"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
