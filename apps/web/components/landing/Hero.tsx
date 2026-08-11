// @ts-nocheck
"use client";

import React from "react";
import { Button, Badge } from "@student-erp/ui";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl opacity-50 -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                New: AI-Ready Architecture
              </Badge>
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6 text-balance leading-[1.1]">
              <motion.span 
                className="inline-block text-foreground"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              >
                Run Your Entire
              </motion.span><br />
              <motion.span 
                className="inline-block text-primary"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              >
                Institution
              </motion.span><br />
              <motion.span 
                className="inline-block"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              >
                From One Platform.
              </motion.span>
            </h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
            >
              The modern, cloud-based Academic ERP built for schools, colleges, and universities. Digitize the complete lifecycle from admission to alumni.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
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
              className="flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="rounded-full" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-primary text-primary" />
                <Star className="size-4 fill-primary text-primary" />
                <Star className="size-4 fill-primary text-primary" />
                <Star className="size-4 fill-primary text-primary" />
                <Star className="size-4 fill-primary text-primary" />
              </div>
              <span>Trusted by 500+ institutions</span>
            </motion.div>
          </div>
          
          {/* Right Dashboard Mockup */}
          <motion.div 
            className="flex-1 w-full max-w-2xl lg:max-w-none perspective-1000"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative rounded-3xl border border-white/10 bg-black/5 p-2 shadow-2xl backdrop-blur-xl">
              <div className="absolute -inset-0.5 rounded-3xl bg-primary/20 blur-2xl" />
              <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl aspect-video flex flex-col">
                {/* Mockup Header */}
                <div className="h-10 border-b border-border bg-muted/50 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="mx-auto w-1/3 h-5 bg-background rounded-md shadow-sm border border-border" />
                </div>
                {/* Mockup Body */}
                <div className="flex-1 p-4 flex gap-4 bg-background">
                  {/* Sidebar */}
                  <div className="w-1/4 flex flex-col gap-2">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted/50 rounded w-full" />
                    <div className="h-4 bg-muted/50 rounded w-full" />
                    <div className="h-4 bg-primary/20 rounded w-full border-l-2 border-primary" />
                    <div className="h-4 bg-muted/50 rounded w-5/6" />
                  </div>
                  {/* Main Content */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-muted rounded w-1/3" />
                      <div className="h-8 bg-primary/10 rounded w-1/4" />
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-20 bg-card border border-border rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-6 bg-foreground/80 rounded w-3/4 mt-auto" />
                      </div>
                      <div className="h-20 bg-card border border-border rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-6 bg-foreground/80 rounded w-3/4 mt-auto" />
                      </div>
                      <div className="h-20 bg-card border border-border rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-6 bg-foreground/80 rounded w-3/4 mt-auto" />
                      </div>
                    </div>
                    {/* Chart Area */}
                    <div className="flex-1 bg-muted/30 border border-border rounded-lg p-4 flex items-end gap-2 pt-8">
                       {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                         <div key={i} className="flex-1 bg-primary/80 rounded-t-sm transition-all hover:bg-primary" style={{ height: `${h}%` }} />
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
