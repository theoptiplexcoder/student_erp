import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './lib/utils';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  HelpCircle,
  MinusCircle,
  Sparkles,
} from 'lucide-react';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors select-none',
  {
    variants: {
      status: {
        active:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        enrolled:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        present:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        approved:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        completed:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',

        pending:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        applicant:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        in_progress:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        late: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',

        inactive:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
        draft:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
        withdrawn:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
        alumni:
          'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
        graduated:
          'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/60',

        scheduled:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',
        admitted:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60',

        absent:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60',
        rejected:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60',
        suspended:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60',
        failed:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60',
      },
      size: {
        sm: 'text-[11px] px-2 py-0.5',
        default: 'text-xs px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'default',
    },
  },
);

export type ERPStatusType =
  | 'active'
  | 'enrolled'
  | 'present'
  | 'approved'
  | 'completed'
  | 'pending'
  | 'applicant'
  | 'in_progress'
  | 'late'
  | 'inactive'
  | 'draft'
  | 'withdrawn'
  | 'alumni'
  | 'graduated'
  | 'scheduled'
  | 'admitted'
  | 'absent'
  | 'rejected'
  | 'suspended'
  | 'failed';

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean;
  statusText?: string;
}

export function StatusBadge({
  status = 'pending',
  size,
  showIcon = true,
  statusText,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const normStatus = (status || 'pending').toLowerCase() as ERPStatusType;

  const renderIcon = () => {
    switch (normStatus) {
      case 'active':
      case 'enrolled':
      case 'present':
      case 'approved':
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />;
      case 'pending':
      case 'applicant':
      case 'in_progress':
      case 'late':
        return <Clock className="h-3 w-3 stroke-[2.5]" />;
      case 'scheduled':
      case 'admitted':
        return <Sparkles className="h-3 w-3 stroke-[2.5]" />;
      case 'graduated':
      case 'alumni':
      case 'draft':
      case 'inactive':
      case 'withdrawn':
        return <MinusCircle className="h-3 w-3 stroke-[2.5]" />;
      case 'absent':
      case 'rejected':
      case 'suspended':
      case 'failed':
        return <XCircle className="h-3 w-3 stroke-[2.5]" />;
      default:
        return <HelpCircle className="h-3 w-3 stroke-[2.5]" />;
    }
  };

  const displayText =
    statusText ||
    (typeof children === 'string'
      ? children
      : normStatus.charAt(0).toUpperCase() + normStatus.slice(1).replace('_', ' '));

  return (
    <span className={cn(statusBadgeVariants({ status: normStatus, size }), className)} {...props}>
      {showIcon && renderIcon()}
      <span>{displayText}</span>
    </span>
  );
}
