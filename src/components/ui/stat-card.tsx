import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  iconClassName?: string;
  cardClassName?: string;
  accentBorder?: 'default' | 'amber' | 'emerald' | 'blue' | 'rose';
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  cardClassName,
  accentBorder = 'default',
  onClick,
}: StatCardProps) {
  const borderClass =
    accentBorder === 'amber'
      ? 'border-amber-200/80 hover:border-amber-300'
      : accentBorder === 'emerald'
        ? 'border-emerald-200/80 hover:border-emerald-300'
        : accentBorder === 'blue'
          ? 'border-blue-200/80 hover:border-blue-300'
          : accentBorder === 'rose'
            ? 'border-rose-200/80 hover:border-rose-300'
            : 'border-slate-200/80 hover:border-slate-300';

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-3.5 sm:p-4 bg-white shadow-2xs interactive-card rounded-xl border flex flex-col justify-between select-none',
        borderClass,
        onClick && 'cursor-pointer',
        cardClassName
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
          {label}
        </span>
        <div
          className={cn(
            'p-1.5 rounded-lg flex items-center justify-center flex-shrink-0',
            iconClassName || 'bg-slate-100 text-slate-600'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-0.5">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
          {value}
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
