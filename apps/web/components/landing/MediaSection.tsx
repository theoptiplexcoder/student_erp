"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function MediaSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-6xl mx-auto relative rounded-3xl border border-border/50 bg-muted/20 p-2 shadow-2xl"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[120px] rounded-full -z-10" />
            
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-card shadow-2xl aspect-[16/9] flex items-center justify-center">
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
