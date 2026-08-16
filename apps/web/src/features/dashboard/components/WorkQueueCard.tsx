import React from 'react';
import { CheckCircle2, FileText, UserPlus, FileWarning } from 'lucide-react';

const queueItems = [
  {
    id: 1,
    type: 'Admission',
    title: 'Review 15 new applicant profiles',
    time: '2 hours ago',
    icon: UserPlus,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 2,
    type: 'Faculty',
    title: "Approve Dr. Smith's leave request",
    time: '4 hours ago',
    icon: FileText,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    id: 3,
    type: 'Fee',
    title: 'Verify fee concession for 3 students',
    time: 'Yesterday',
    icon: FileWarning,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
];

export function WorkQueueCard() {
  return (
    <div className="bg-card border-border flex h-full flex-col overflow-hidden rounded-xl border shadow-sm">
      <div className="border-border flex items-center justify-between border-b p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            Work Queue
            <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-bold">
              3 Pending
            </span>
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">Approvals requiring your attention</p>
        </div>
      </div>

      <div className="flex-1 p-0">
        {queueItems.length > 0 ? (
          <ul className="divide-border divide-y">
            {queueItems.map((item) => (
              <li
                key={item.id}
                className="hover:bg-muted/50 group flex cursor-pointer items-start gap-4 p-4 transition-colors"
              >
                <div className={`rounded-lg p-2 ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="group-hover:text-primary text-sm font-medium transition-colors">
                    {item.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">{item.type}</span>
                    <span className="text-muted-foreground text-xs opacity-50">•</span>
                    <span className="text-muted-foreground text-xs">{item.time}</span>
                  </div>
                </div>
                <button className="hover:bg-primary/10 text-muted-foreground hover:text-primary flex h-8 w-8 items-center justify-center rounded-full transition-colors">
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="bg-primary/10 mb-4 rounded-full p-4">
              <CheckCircle2 className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-foreground font-semibold">No pending approvals</h3>
            <p className="text-muted-foreground mt-1 max-w-[200px] text-sm">
              You're all caught up on your administrative queue.
            </p>
          </div>
        )}
      </div>

      <div className="border-border bg-muted/20 border-t p-3">
        <button className="text-primary w-full text-center text-sm font-medium hover:underline">
          View All Approvals
        </button>
      </div>
    </div>
  );
}
