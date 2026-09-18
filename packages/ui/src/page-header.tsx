import * as React from 'react';
import { cn } from './lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string | React.ReactNode;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn('border-border/70 mb-6 flex flex-col gap-4 border-b pb-5', className)}
      {...props}
    >
      {breadcrumbs && <div className="text-muted-foreground text-xs">{breadcrumbs}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-foreground font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">{description}</p>
          )}
        </div>

        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
      </div>

      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'default' | 'full' | 'narrow';
}

export function PageContainer({
  maxWidth = 'default',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full space-y-6 p-4 sm:p-6 lg:p-8',
        maxWidth === 'narrow' && 'max-w-5xl',
        maxWidth === 'default' && 'max-w-7xl',
        maxWidth === 'full' && 'max-w-none',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
