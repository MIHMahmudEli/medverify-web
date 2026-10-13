import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs',
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
        <Icon className="h-6 w-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
