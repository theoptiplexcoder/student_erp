// @ts-nocheck
"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import { Card } from "@student-erp/ui";
import { motion } from "framer-motion";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="w-full p-8 md:p-10 border-border/50 shadow-2xl shadow-primary/5 bg-card/90 backdrop-blur-md rounded-3xl">
        <div className="flex flex-col items-center text-center mb-8">
          {/* Mobile Logo Only */}
          <div className="lg:hidden bg-primary/10 p-2 rounded-xl border border-primary/20 text-primary mb-6 inline-flex">
            <GraduationCap className="size-8" />
          </div>
          
          <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {children}
      </Card>
    </motion.div>
  );
}
