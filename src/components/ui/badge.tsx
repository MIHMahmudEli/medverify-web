import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all uppercase tracking-wider shadow-2xs',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-slate-50',
        secondary:
          'bg-slate-100 text-slate-700 border border-slate-200/80',
        fit:
          'bg-emerald-50 text-emerald-800 border border-emerald-300/80',
        unfit:
          'bg-rose-50 text-rose-800 border border-rose-300/80',
        pending:
          'bg-amber-50 text-amber-800 border border-amber-300/80',
        draft:
          'bg-slate-100 text-slate-600 border border-slate-300/80',
        revoked:
          'bg-red-100 text-red-900 border border-red-400/80',
        outline:
          'text-slate-800 border border-slate-300 bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
}

function Badge({ className, variant, withDot = true, children, ...props }: BadgeProps) {
  const dotColor =
    variant === 'fit'
      ? 'bg-emerald-500'
      : variant === 'unfit' || variant === 'revoked'
        ? 'bg-rose-500'
        : variant === 'pending'
          ? 'bg-amber-500'
          : variant === 'draft'
            ? 'bg-slate-400'
            : 'bg-slate-500';

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', dotColor)} />}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
