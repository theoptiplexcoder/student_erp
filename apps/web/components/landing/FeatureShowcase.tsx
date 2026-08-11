// @ts-nocheck
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@student-erp/ui";

const features = [
  {
    title: "Student Lifecycle",
    description: "Applicant → Admission → Enrollment → Graduation → Alumni. Manage everything seamlessly.",
    icon: <Users className="size-6 text-primary" />,
  },
  {
    title: "Faculty & Academics",
    description: "Curriculum planning, examinations, grading, and attendance tracking made effortless.",
    icon: <BookOpen className="size-6 text-chart-1" />,
  },
  {
    title: "Administration",
    description: "Fee management, payroll, HR, and compliance built for large institutions.",
    icon: <Building2 className="size-6 text-chart-2" />,
  },
  {
    title: "Certificates & Alumni",
    description: "Automated digital certificate generation and alumni engagement portals.",
    icon: <GraduationCap className="size-6 text-chart-3" />,
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption, role-based access control, and comprehensive audit logs.",
    icon: <Building2 className="size-6 text-primary" />,
  },
  {
    title: "Seamless Integrations",
    description: "Connect with your existing tools: LMS, Payment Gateways, and Communication APIs.",
    icon: <BookOpen className="size-6 text-chart-1" />,
  }
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold mb-6"
          >
            Built for Modern Education
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            A modular, comprehensive platform designed to handle the complexity of modern institutions.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full bg-background border-border hover:border-primary/50 group cursor-default">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm md:text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Alternating Layout 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <h3 className="text-3xl font-display font-bold mb-4">Real-time Student Analytics</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Empower faculty and guardians with real-time insights into student attendance, performance, and behavior. Identify trends before they become issues.
            </p>
            <ul className="space-y-3">
              {['Predictive performance tracking', 'Automated guardian alerts', 'Comprehensive transcript generation'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">✓</div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <div className="rounded-2xl bg-card border border-border shadow-xl p-6 aspect-video flex flex-col gap-4">
              <div className="h-8 bg-muted rounded w-1/3 mb-4" />
              <div className="flex gap-4 h-32">
                <div className="flex-1 bg-chart-1/20 rounded-lg flex items-end justify-center pb-4"><div className="w-12 h-24 bg-chart-1 rounded-t-sm" /></div>
                <div className="flex-1 bg-chart-2/20 rounded-lg flex items-end justify-center pb-4"><div className="w-12 h-16 bg-chart-2 rounded-t-sm" /></div>
                <div className="flex-1 bg-chart-3/20 rounded-lg flex items-end justify-center pb-4"><div className="w-12 h-20 bg-chart-3 rounded-t-sm" /></div>
              </div>
              <div className="h-4 bg-muted/50 rounded w-full mt-auto" />
            </div>
          </motion.div>
        </div>

        {/* Alternating Layout 2 */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <div className="rounded-2xl bg-card border border-border shadow-xl p-6 aspect-video flex flex-col gap-2">
              <div className="flex gap-2 border-b border-border pb-4 mb-4">
                <div className="h-6 bg-primary/20 rounded w-24" />
                <div className="h-6 bg-muted rounded w-24" />
                <div className="h-6 bg-muted rounded w-24" />
              </div>
              <div className="h-10 bg-muted/40 rounded w-full flex items-center px-4"><div className="h-4 bg-muted rounded w-1/2" /></div>
              <div className="h-10 bg-muted/40 rounded w-full flex items-center px-4"><div className="h-4 bg-muted rounded w-3/4" /></div>
              <div className="h-10 bg-muted/40 rounded w-full flex items-center px-4"><div className="h-4 bg-muted rounded w-2/3" /></div>
            </div>
          </motion.div>
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          >
            <h3 className="text-3xl font-display font-bold mb-4">Seamless Administration</h3>
            <p className="text-muted-foreground text-lg mb-6">
              From admissions to fee collection, automate your entire back-office operations. Reduce manual errors and save hundreds of hours per semester.
            </p>
            <ul className="space-y-3">
              {['Multi-campus management', 'Role-based access control (RBAC)', 'Enterprise-grade audit logs'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-chart-1/10 flex items-center justify-center text-chart-1 text-sm">✓</div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
