// @ts-nocheck
import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains a special character", met: /[^A-Za-z0-9]/.test(password) },
    { label: "Contains an uppercase letter", met: /[A-Z]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  let strengthColor = "bg-muted";
  let strengthLabel = "Weak";

  if (metCount === 1 || metCount === 2) {
    strengthColor = "bg-yellow-500";
    strengthLabel = "Fair";
  } else if (metCount === 3) {
    strengthColor = "bg-blue-500";
    strengthLabel = "Good";
  } else if (metCount === 4) {
    strengthColor = "bg-emerald-500";
    strengthLabel = "Strong";
  }

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center justify-between text-xs font-medium">
        <span>Password strength</span>
        <span className={metCount === 0 ? "text-muted-foreground" : "text-foreground"}>
          {metCount === 0 ? "None" : strengthLabel}
        </span>
      </div>
      
      <div className="flex gap-1 h-1.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-300 ${
              i < metCount ? strengthColor : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {criteria.map((c, i) => (
          <div key={i} className={`flex items-center text-xs ${c.met ? "text-foreground" : "text-muted-foreground"}`}>
            {c.met ? <Check className="size-3 mr-1.5 text-emerald-500" /> : <X className="size-3 mr-1.5 opacity-50" />}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
