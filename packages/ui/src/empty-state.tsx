import * as React from 'react';
import { cn } from './lib/utils';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border/80 bg-muted/20 animate-fade-in flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center',
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="bg-muted border-border/60 text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
          <Icon className="h-6 w-6" />
        </div>
      )}

      <h3 className="text-foreground font-display text-base font-semibold tracking-tight sm:text-lg">
        {title}
      </h3>

      {description && (
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          <Button onClick={action.onClick} size="sm" className="gap-2 shadow-xs">
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
