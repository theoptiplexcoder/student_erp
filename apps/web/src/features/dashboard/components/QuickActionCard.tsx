import React from 'react';
import { UserPlus, BookOpen, GraduationCap, CalendarClock, Settings } from 'lucide-react';

const actions = [
  { label: 'Add Student', icon: UserPlus },
  { label: 'Create Course', icon: BookOpen },
  { label: 'Generate Certificate', icon: GraduationCap },
  { label: 'Create Timetable', icon: CalendarClock },
  { label: 'Manage Users', icon: Settings },
];

export function QuickActionCard() {
  return (
    <div className="bg-card border-border h-full rounded-xl border p-5 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold">Quick Actions</h2>
      <p className="text-muted-foreground mb-4 text-xs">Common administrative tasks</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action, i) => (
          <button
            key={i}
            className="border-border bg-background hover:border-primary/50 hover:bg-primary/5 group flex flex-col items-center justify-center gap-3 rounded-xl border p-4 text-center transition-all"
          >
            <div className="bg-muted group-hover:bg-primary/10 rounded-lg p-3 transition-colors">
              <action.icon className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
            </div>
            <span className="text-foreground text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
