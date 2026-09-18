import * as React from 'react';
import { cn } from './lib/utils';
import { Card, CardContent } from './card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string | number;
    direction?: 'up' | 'down' | 'neutral';
    label?: string;
  };
  subtitle?: string | React.ReactNode;
  badge?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  subtitle,
  badge,
  variant = 'default',
  className,
  ...props
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === 'up')
      return <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
    if (trend.direction === 'down')
      return <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
    return <Minus className="text-muted-foreground h-3.5 w-3.5" />;
  };

  const getTrendClass = () => {
    if (!trend) return '';
    if (trend.direction === 'up') return 'text-emerald-600 dark:text-emerald-400 font-medium';
    if (trend.direction === 'down') return 'text-red-600 dark:text-red-400 font-medium';
    return 'text-muted-foreground';
  };

  return (
    <Card
      className={cn(
        'border-border/80 hover:border-border relative overflow-hidden transition-all duration-150 hover:shadow-xs',
        className,
      )}
      {...props}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground truncate text-xs font-medium tracking-wider uppercase">
            {label}
          </p>
          <div className="flex items-center gap-1.5">
            {badge && <div>{badge}</div>}
            {Icon && (
              <div className="bg-muted/60 text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                <Icon className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-foreground font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </div>
        </div>

        {(trend || subtitle) && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {trend && (
              <span className={cn('inline-flex items-center gap-1', getTrendClass())}>
                {getTrendIcon()}
                <span>{trend.value}</span>
              </span>
            )}
            {trend?.label && <span className="text-muted-foreground">{trend.label}</span>}
            {subtitle && !trend && <span className="text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
