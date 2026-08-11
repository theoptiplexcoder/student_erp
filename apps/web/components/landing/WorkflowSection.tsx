// @ts-nocheck
"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Briefcase, Users, LayoutDashboard, LineChart, FileText } from "lucide-react";

const steps = [
  { icon: <UserPlus className="size-6 text-primary" />, title: "Sign Up", description: "Create your account in seconds." },
  { icon: <Briefcase className="size-6 text-primary" />, title: "Create Workspace", description: "Set up your institution's profile." },
  { icon: <Users className="size-6 text-primary" />, title: "Invite Team", description: "Onboard faculty and administrators." },
  { icon: <LayoutDashboard className="size-6 text-primary" />, title: "Manage Projects", description: "Organize academic workflows." },
  { icon: <LineChart className="size-6 text-primary" />, title: "Track Progress", description: "Monitor student and staff performance." },
  { icon: <FileText className="size-6 text-primary" />, title: "Generate Reports", description: "Export beautiful analytics." },
];

export function WorkflowSection() {
  return (
    <section className="py-24 bg-card/30 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A seamless journey from initial setup to running a fully digital institution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (desktop only) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-[2px] bg-border z-0" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="size-16 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center mb-6 group-hover:border-primary/50 group-hover:shadow-md transition-all duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold font-display mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm max-w-[250px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
