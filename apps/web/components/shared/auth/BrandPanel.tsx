// @ts-nocheck
"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export function BrandPanel() {
  return (
    <div className="w-full h-full bg-card relative overflow-hidden flex flex-col p-12 justify-between">
      {/* Background Animated Gradient / Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 text-primary mb-8">
          <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
            <GraduationCap className="size-8" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">Student ERP</span>
        </div>
        
        <h1 className="text-3xl lg:text-4xl font-display font-bold leading-tight mb-4 text-foreground/90">
          The operating system for modern education.
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          A unified workspace for administrators, faculty, and students to collaborate, learn, and grow.
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="size-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">A</div>
            <div className="size-10 rounded-full bg-blue-500/10 border-2 border-background flex items-center justify-center text-xs font-bold text-blue-500">F</div>
            <div className="size-10 rounded-full bg-emerald-500/10 border-2 border-background flex items-center justify-center text-xs font-bold text-emerald-500">S</div>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Join 10,000+ institutions globally.
          </p>
        </div>
      </div>
    </div>
  );
}
