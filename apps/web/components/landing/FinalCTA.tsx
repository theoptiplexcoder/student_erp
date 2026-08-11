// @ts-nocheck
"use client";

import React from "react";
import { Button } from "@student-erp/ui";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden bg-primary text-primary-foreground">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 max-w-3xl mx-auto tracking-tight">
          Ready to Modernize Your Institution?
        </h2>
        <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto opacity-90">
          Join 500+ institutions already using Student ERP to transform their academic operations.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 hover:-translate-y-1 transition-transform">
            Sign Up
            <ArrowRight className="ml-2 size-5" />
          </Button>
          <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
}
