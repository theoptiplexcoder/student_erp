// @ts-nocheck
"use client";

import React from "react";
import { ShieldCheck, Lock, Activity, KeyRound, Server, FileSearch } from "lucide-react";
import { Card, CardContent } from "@student-erp/ui";
import { motion } from "framer-motion";

const securityFeatures = [
  { icon: <ShieldCheck className="size-6 text-emerald-500" />, title: "Enterprise Security", description: "Bank-grade encryption for all data at rest and in transit." },
  { icon: <KeyRound className="size-6 text-emerald-500" />, title: "Single Sign-On (SSO)", description: "Integrate with SAML, OAuth, and Active Directory." },
  { icon: <Lock className="size-6 text-emerald-500" />, title: "Role-Based Access", description: "Granular permission controls for every user type." },
  { icon: <FileSearch className="size-6 text-emerald-500" />, title: "Audit Logs", description: "Comprehensive tracking of all system modifications." },
  { icon: <Server className="size-6 text-emerald-500" />, title: "Compliance", description: "Built to meet FERPA, GDPR, and SOC2 standards." },
  { icon: <Activity className="size-6 text-emerald-500" />, title: "99.99% Uptime", description: "Highly available infrastructure with global edge routing." },
];

export function SecuritySection() {
  return (
    <section className="py-24 bg-card/10 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/3">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Enterprise Grade. By Default.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We take the security of your institution's data seriously. Our infrastructure is built from the ground up to protect student privacy and ensure compliance at scale.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
              <ShieldCheck className="size-4" />
              SOC2 Type II Certified
            </div>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {securityFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full bg-background border-border/50 hover:border-border transition-colors">
                  <CardContent className="p-6">
                    <div className="mb-4 bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <h4 className="font-bold font-display mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
