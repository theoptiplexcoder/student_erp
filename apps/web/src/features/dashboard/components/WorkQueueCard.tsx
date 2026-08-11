import React from "react";
import { CheckCircle2, FileText, UserPlus, FileWarning } from "lucide-react";

const queueItems = [
  { id: 1, type: "Admission", title: "Review 15 new applicant profiles", time: "2 hours ago", icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, type: "Faculty", title: "Approve Dr. Smith's leave request", time: "4 hours ago", icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: 3, type: "Fee", title: "Verify fee concession for 3 students", time: "Yesterday", icon: FileWarning, color: "text-red-500", bg: "bg-red-500/10" },
];

export function WorkQueueCard() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            Work Queue
            <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-0.5 rounded-full">
              3 Pending
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Approvals requiring your attention</p>
        </div>
      </div>
      
      <div className="flex-1 p-0">
        {queueItems.length > 0 ? (
          <ul className="divide-y divide-border">
            {queueItems.map((item) => (
              <li key={item.id} className="p-4 hover:bg-muted/50 transition-colors flex items-start gap-4 cursor-pointer group">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{item.type}</span>
                    <span className="text-xs text-muted-foreground opacity-50">•</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">No pending approvals</h3>
            <p className="text-sm text-muted-foreground max-w-[200px] mt-1">You're all caught up on your administrative queue.</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-border bg-muted/20">
        <button className="w-full text-center text-sm font-medium text-primary hover:underline">
          View All Approvals
        </button>
      </div>
    </div>
  );
}
