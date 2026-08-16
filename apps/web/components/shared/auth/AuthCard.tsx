'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Card } from '@student-erp/ui';
import { motion } from 'framer-motion';

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
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      <Card className="border-border/50 shadow-primary/5 bg-card/90 w-full rounded-3xl p-8 shadow-2xl backdrop-blur-md md:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* Mobile Logo Only */}
          <div className="bg-primary/10 border-primary/20 text-primary mb-6 inline-flex rounded-xl border p-2 lg:hidden">
            <GraduationCap className="size-8" />
          </div>

          <h2 className="font-display mb-2 text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>

        {children}
      </Card>
    </motion.div>
  );
}
