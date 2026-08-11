// @ts-nocheck
"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserCog, BookUser, GraduationCap, Users } from "lucide-react";
import { Card, CardContent } from "@student-erp/ui";

const personas = [
  {
    role: "Institution Administrator",
    icon: <UserCog className="size-8 text-primary" />,
    responsibilities: ["Multi-campus management", "Financial overview", "Policy enforcement"],
    stats: "100+ Reports",
  },
  {
    role: "Faculty Member",
    icon: <BookUser className="size-8 text-chart-2" />,
    responsibilities: ["Curriculum delivery", "Grading & Attendance", "Student mentorship"],
    stats: "Automated Grading",
  },
  {
    role: "Student",
    icon: <GraduationCap className="size-8 text-chart-4" />,
    responsibilities: ["Course enrollment", "Assignment submission", "Peer collaboration"],
    stats: "Mobile App Access",
  },
  {
    role: "Guardian",
    icon: <Users className="size-8 text-chart-1" />,
    responsibilities: ["Performance monitoring", "Fee payment", "Direct communication"],
    stats: "Real-time Alerts",
  }
];

export function PersonaSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl -z-10 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 -translate-y-1/2" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Built for Every User</h2>
          <p className="text-lg text-muted-foreground">
            Dedicated workspaces tailored specifically for the unique needs of each role in your institution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-6">{persona.icon}</div>
                  <h3 className="text-xl font-bold font-display mb-4">{persona.role}</h3>
                  <ul className="space-y-2 mb-8 flex-1">
                    {persona.responsibilities.map((req, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span> {req}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-border mt-auto">
                    <span className="text-sm font-medium text-foreground">{persona.stats}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
