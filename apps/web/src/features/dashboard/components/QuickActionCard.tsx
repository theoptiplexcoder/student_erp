import React from "react";
import { UserPlus, BookOpen, GraduationCap, CalendarClock, Settings } from "lucide-react";

const actions = [
  { label: "Add Student", icon: UserPlus },
  { label: "Create Course", icon: BookOpen },
  { label: "Generate Certificate", icon: GraduationCap },
  { label: "Create Timetable", icon: CalendarClock },
  { label: "Manage Users", icon: Settings },
];

export function QuickActionCard() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-5 h-full">
      <h2 className="font-semibold text-lg mb-1">Quick Actions</h2>
      <p className="text-xs text-muted-foreground mb-4">Common administrative tasks</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action, i) => (
          <button 
            key={i}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all text-center group"
          >
            <div className="bg-muted group-hover:bg-primary/10 p-3 rounded-lg transition-colors">
              <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
