'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export function BrandPanel() {
  return (
    <div className="bg-card relative flex h-full w-full flex-col justify-between overflow-hidden p-12">
      {/* Background Animated Gradient / Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-primary/20 absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10">
        <div className="text-primary mb-8 flex items-center gap-3">
          <div className="bg-primary/10 border-primary/20 rounded-xl border p-2">
            <GraduationCap className="size-8" />
          </div>
          <span className="font-display text-foreground text-2xl font-bold tracking-tight">
            Student ERP
          </span>
        </div>

        <h1 className="font-display text-foreground/90 mb-4 text-3xl leading-tight font-bold lg:text-4xl">
          The operating system for modern education.
        </h1>
        <p className="text-muted-foreground max-w-md text-lg">
          A unified workspace for administrators, faculty, and students to collaborate, learn, and
          grow.
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="bg-primary/10 border-background text-primary flex size-10 items-center justify-center rounded-full border-2 text-xs font-bold">
              A
            </div>
            <div className="border-background flex size-10 items-center justify-center rounded-full border-2 bg-blue-500/10 text-xs font-bold text-blue-500">
              F
            </div>
            <div className="border-background flex size-10 items-center justify-center rounded-full border-2 bg-emerald-500/10 text-xs font-bold text-emerald-500">
              S
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Join 10,000+ institutions globally.
          </p>
        </div>
      </div>
    </div>
  );
}
