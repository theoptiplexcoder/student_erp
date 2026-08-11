// @ts-nocheck
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cloud, Database, CreditCard, MessageSquare, Code, PenTool, Mail, Video, Calendar } from "lucide-react";

const integrations = [
  { name: "Cloud Storage", icon: <Cloud className="size-8 text-foreground/70" /> },
  { name: "Database", icon: <Database className="size-8 text-foreground/70" /> },
  { name: "Payments", icon: <CreditCard className="size-8 text-foreground/70" /> },
  { name: "Communication", icon: <MessageSquare className="size-8 text-foreground/70" /> },
  { name: "Version Control", icon: <Code className="size-8 text-foreground/70" /> },
  { name: "Design", icon: <PenTool className="size-8 text-foreground/70" /> },
  { name: "Email", icon: <Mail className="size-8 text-foreground/70" /> },
  { name: "Video Calls", icon: <Video className="size-8 text-foreground/70" /> },
  { name: "Scheduling", icon: <Calendar className="size-8 text-foreground/70" /> },
];

export function IntegrationsSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden border-t border-border">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
      
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Connects with your stack</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-16">
          Student ERP integrates seamlessly with the tools your institution already relies on, bringing all your workflows into one unified platform.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 max-w-5xl mx-auto">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="mb-4 transform group-hover:scale-110 group-hover:text-primary transition-transform duration-300">
                {integration.icon}
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {integration.name}
              </span>
            </motion.div>
          ))}
          
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 9 * 0.05, duration: 0.4 }}
             className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border border-dashed border-border bg-transparent hover:bg-card/50 hover:border-primary/50 transition-all cursor-pointer col-span-2 md:col-span-1 lg:col-span-1"
          >
            <span className="text-sm font-medium text-primary">
              View all 50+ integrations &rarr;
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
