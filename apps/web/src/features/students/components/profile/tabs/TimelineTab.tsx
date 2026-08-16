'use client';
import React from 'react';
import { CheckCircle2, UserPlus, CreditCard, FileCheck, GraduationCap } from 'lucide-react';

const timelineEvents = [
  {
    id: 1,
    title: 'Document Verified',
    desc: '10th Grade Marksheet was verified by John Admin.',
    date: 'Today, 10:45 AM',
    icon: FileCheck,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 2,
    title: 'Fee Paid',
    desc: 'First semester fee of $4,500 was paid successfully.',
    date: 'Aug 20, 2024',
    icon: CreditCard,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    id: 3,
    title: 'Section Assigned',
    desc: 'Assigned to Section A of B.Tech Computer Science.',
    date: 'Aug 18, 2024',
    icon: GraduationCap,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    id: 4,
    title: 'Admitted',
    desc: 'Student registration completed.',
    date: 'Aug 12, 2024',
    icon: UserPlus,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export function TimelineTab() {
  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="border-border relative ml-6 space-y-8 border-l pb-8 md:ml-8">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="group relative flex items-start pl-8">
            {/* Timeline Dot/Icon */}
            <div
              className={`border-background absolute top-0 -left-5 flex h-10 w-10 items-center justify-center rounded-full border-[4px] ${event.bg} shadow-sm transition-transform group-hover:scale-110`}
            >
              <event.icon className={`h-4 w-4 ${event.color}`} />
            </div>

            {/* Content */}
            <div className="bg-card border-border group-hover:border-primary/30 w-full rounded-xl border p-5 shadow-sm transition-colors">
              <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <h4 className="text-foreground text-base font-semibold">{event.title}</h4>
                <span className="text-muted-foreground bg-muted rounded-md px-2 py-1 text-xs font-medium">
                  {event.date}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{event.desc}</p>
            </div>
          </div>
        ))}

        {/* End of timeline indicator */}
        <div className="bg-muted border-background absolute bottom-0 -left-2.5 flex h-5 w-5 items-center justify-center rounded-full border-[4px]">
          <div className="bg-muted-foreground/50 h-1.5 w-1.5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
