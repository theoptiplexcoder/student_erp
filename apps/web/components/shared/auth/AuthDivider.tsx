import React from 'react';

export function AuthDivider({ text = 'OR' }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="border-border w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card text-muted-foreground px-2 font-medium">{text}</span>
      </div>
    </div>
  );
}
