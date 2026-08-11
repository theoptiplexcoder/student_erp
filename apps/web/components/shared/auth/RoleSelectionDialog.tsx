// @ts-nocheck
"use client";

import React from "react";
import { GraduationCap, Users, UserCog, Building, Briefcase, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Checkbox, Button } from "@student-erp/ui";
import { motion } from "framer-motion";

interface Role {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  lastUsed?: boolean;
}

const userRoles: Role[] = [
  { id: "student", name: "Student", description: "Access courses, grades, and schedule.", icon: GraduationCap, lastUsed: true },
  { id: "dept_admin", name: "Department Admin", description: "Manage faculty and department resources.", icon: Building },
  { id: "faculty", name: "Faculty", description: "Manage courses, assignments, and grading.", icon: Briefcase },
  { id: "system_admin", name: "System Administrator", description: "Platform configuration and user management.", icon: UserCog },
];

export function RoleSelectionDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [selectedRole, setSelectedRole] = React.useState<string>(userRoles[0].id);
  const [remember, setRemember] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
        <div className="p-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">Select Workspace</DialogTitle>
            <DialogDescription>
              Your account has multiple roles. Choose which workspace to enter.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {userRoles.map((role, idx) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full flex items-center p-4 rounded-xl border text-left transition-all duration-200 ${
                  isSelected 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm" 
                    : "border-border bg-background hover:border-primary/40 hover:bg-card/50"
                }`}
              >
                <div className={`p-3 rounded-lg mr-4 ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="size-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {role.name}
                    </h4>
                    {role.lastUsed && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Last Used
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{role.description}</p>
                </div>
                <ChevronRight className={`size-5 transition-transform duration-300 ${isSelected ? "text-primary translate-x-1" : "text-muted-foreground"}`} />
              </motion.button>
            );
          })}
        </div>

        <div className="p-6 pt-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-role" checked={remember} onCheckedChange={(c) => setRemember(c as boolean)} />
            <label htmlFor="remember-role" className="text-sm font-medium leading-none cursor-pointer">
              Remember my choice
            </label>
          </div>
          <Button onClick={() => onOpenChange(false)}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
