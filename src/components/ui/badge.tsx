import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold transition-colors uppercase tracking-wider',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-slate-50',
        secondary:
          'bg-slate-100 text-slate-800 border border-slate-200',
        fit:
          'bg-emerald-50 text-emerald-800 border border-emerald-300',
        unfit:
          'bg-rose-50 text-rose-800 border border-rose-300',
        pending:
          'bg-amber-50 text-amber-800 border border-amber-300',
        draft:
          'bg-slate-100 text-slate-600 border border-slate-300',
        revoked:
          'bg-red-100 text-red-900 border border-red-400',
        outline: 'text-slate-800 border border-slate-300 bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
