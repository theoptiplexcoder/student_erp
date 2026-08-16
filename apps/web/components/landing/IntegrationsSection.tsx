'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  Database,
  CreditCard,
  MessageSquare,
  Code,
  PenTool,
  Mail,
  Video,
  Calendar,
} from 'lucide-react';

const integrations = [
  { name: 'Cloud Storage', icon: <Cloud className="text-foreground/70 size-8" /> },
  { name: 'Database', icon: <Database className="text-foreground/70 size-8" /> },
  { name: 'Payments', icon: <CreditCard className="text-foreground/70 size-8" /> },
  { name: 'Communication', icon: <MessageSquare className="text-foreground/70 size-8" /> },
  { name: 'Version Control', icon: <Code className="text-foreground/70 size-8" /> },
  { name: 'Design', icon: <PenTool className="text-foreground/70 size-8" /> },
  { name: 'Email', icon: <Mail className="text-foreground/70 size-8" /> },
  { name: 'Video Calls', icon: <Video className="text-foreground/70 size-8" /> },
  { name: 'Scheduling', icon: <Calendar className="text-foreground/70 size-8" /> },
];

export function IntegrationsSection() {
  return (
    <section className="bg-background border-border relative overflow-hidden border-t py-24">
      <div className="bg-primary/5 absolute top-0 right-0 -z-10 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display mb-4 text-3xl font-bold md:text-4xl">
          Connects with your stack
        </h2>
        <p className="text-muted-foreground mx-auto mb-16 max-w-2xl text-lg">
          Student ERP integrates seamlessly with the tools your institution already relies on,
          bringing all your workflows into one unified platform.
        </p>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-8 lg:grid-cols-4 xl:grid-cols-5">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group border-border bg-card/50 hover:bg-card hover:border-primary/30 flex cursor-pointer flex-col items-center justify-center rounded-2xl border p-6 transition-all hover:shadow-lg sm:p-8"
            >
              <div className="group-hover:text-primary mb-4 transform transition-transform duration-300 group-hover:scale-110">
                {integration.icon}
              </div>
              <span className="text-muted-foreground group-hover:text-foreground text-sm font-medium transition-colors">
                {integration.name}
              </span>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 9 * 0.05, duration: 0.4 }}
            className="border-border hover:bg-card/50 hover:border-primary/50 col-span-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-transparent p-6 transition-all sm:p-8 md:col-span-1 lg:col-span-1"
          >
            <span className="text-primary text-sm font-medium">
              View all 50+ integrations &rarr;
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
