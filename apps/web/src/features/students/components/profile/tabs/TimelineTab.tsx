"use client";
import React from "react";
import { CheckCircle2, UserPlus, CreditCard, FileCheck, GraduationCap } from "lucide-react";

const timelineEvents = [
  { id: 1, title: "Document Verified", desc: "10th Grade Marksheet was verified by John Admin.", date: "Today, 10:45 AM", icon: FileCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, title: "Fee Paid", desc: "First semester fee of $4,500 was paid successfully.", date: "Aug 20, 2024", icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10" },
  { id: 3, title: "Section Assigned", desc: "Assigned to Section A of B.Tech Computer Science.", date: "Aug 18, 2024", icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: 4, title: "Admitted", desc: "Student registration completed.", date: "Aug 12, 2024", icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
];

export function TimelineTab() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="relative border-l border-border ml-6 md:ml-8 space-y-8 pb-8">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="relative flex items-start pl-8 group">
            {/* Timeline Dot/Icon */}
            <div className={`absolute -left-5 top-0 h-10 w-10 rounded-full flex items-center justify-center border-[4px] border-background ${event.bg} shadow-sm group-hover:scale-110 transition-transform`}>
              <event.icon className={`h-4 w-4 ${event.color}`} />
            </div>
            
            {/* Content */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm w-full group-hover:border-primary/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h4 className="font-semibold text-foreground text-base">{event.title}</h4>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{event.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{event.desc}</p>
            </div>
          </div>
        ))}

        {/* End of timeline indicator */}
        <div className="absolute -left-2.5 bottom-0 h-5 w-5 rounded-full bg-muted border-[4px] border-background flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </div>
  );
}
