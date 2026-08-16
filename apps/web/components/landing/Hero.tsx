'use client';

import React from 'react';
import { Button, Badge } from '@student-erp/ui';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background Gradients */}
      <div className="bg-primary/20 absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl" />

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-8">
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 mb-6 px-4 py-1 text-sm"
              >
                New: AI-Ready Architecture
              </Badge>
            </motion.div>

            <h1 className="font-display mb-6 text-6xl leading-[1.1] font-bold tracking-tight text-balance md:text-7xl lg:text-8xl">
              <motion.span
                className="text-foreground inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Run Your Entire
              </motion.span>
              <br />
              <motion.span
                className="text-primary inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Institution
              </motion.span>
              <br />
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                From One Platform.
              </motion.span>
            </h1>

            <motion.p
              className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg text-balance md:text-xl lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              The modern, cloud-based Academic ERP built for schools, colleges, and universities.
              Digitize the complete lifecycle from admission to alumni.
            </motion.p>

            <motion.div
              className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                View Features
              </Button>
            </motion.div>

            <motion.div
              className="text-muted-foreground flex items-center justify-center gap-4 text-sm lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="border-background bg-secondary flex h-8 w-8 items-center justify-center rounded-full border-2"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="User"
                      className="rounded-full"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Star className="fill-primary text-primary size-4" />
                <Star className="fill-primary text-primary size-4" />
                <Star className="fill-primary text-primary size-4" />
                <Star className="fill-primary text-primary size-4" />
                <Star className="fill-primary text-primary size-4" />
              </div>
              <span>Trusted by 500+ institutions</span>
            </motion.div>
          </div>

          {/* Right Dashboard Mockup */}
          <motion.div
            className="perspective-1000 w-full max-w-2xl flex-1 lg:max-w-none"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative rounded-3xl border border-white/10 bg-black/5 p-2 shadow-2xl backdrop-blur-xl">
              <div className="bg-primary/20 absolute -inset-0.5 rounded-3xl blur-2xl" />
              <div className="border-border bg-card relative flex aspect-video flex-col overflow-hidden rounded-2xl border shadow-2xl">
                {/* Mockup Header */}
                <div className="border-border bg-muted/50 flex h-10 items-center gap-2 border-b px-4">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="bg-background border-border mx-auto h-5 w-1/3 rounded-md border shadow-sm" />
                </div>
                {/* Mockup Body */}
                <div className="bg-background flex flex-1 gap-4 p-4">
                  {/* Sidebar */}
                  <div className="flex w-1/4 flex-col gap-2">
                    <div className="bg-muted mb-4 h-6 w-3/4 rounded" />
                    <div className="bg-muted/50 h-4 w-full rounded" />
                    <div className="bg-muted/50 h-4 w-full rounded" />
                    <div className="bg-primary/20 border-primary h-4 w-full rounded border-l-2" />
                    <div className="bg-muted/50 h-4 w-5/6 rounded" />
                  </div>
                  {/* Main Content */}
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="bg-muted h-6 w-1/3 rounded" />
                      <div className="bg-primary/10 h-8 w-1/4 rounded" />
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-card border-border flex h-20 flex-col gap-2 rounded-lg border p-3 shadow-sm">
                        <div className="bg-muted h-3 w-1/2 rounded" />
                        <div className="bg-foreground/80 mt-auto h-6 w-3/4 rounded" />
                      </div>
                      <div className="bg-card border-border flex h-20 flex-col gap-2 rounded-lg border p-3 shadow-sm">
                        <div className="bg-muted h-3 w-1/2 rounded" />
                        <div className="bg-foreground/80 mt-auto h-6 w-3/4 rounded" />
                      </div>
                      <div className="bg-card border-border flex h-20 flex-col gap-2 rounded-lg border p-3 shadow-sm">
                        <div className="bg-muted h-3 w-1/2 rounded" />
                        <div className="bg-foreground/80 mt-auto h-6 w-3/4 rounded" />
                      </div>
                    </div>
                    {/* Chart Area */}
                    <div className="bg-muted/30 border-border flex flex-1 items-end gap-2 rounded-lg border p-4 pt-8">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <div
                          key={i}
                          className="bg-primary/80 hover:bg-primary flex-1 rounded-t-sm transition-all"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
