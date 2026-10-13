'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Unable to Load Data',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'p-8 text-center flex flex-col items-center justify-center space-y-3 bg-rose-50/50 rounded-xl border border-rose-200/80 shadow-2xs',
        className
      )}
    >
      <div className="h-11 w-11 rounded-xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-xs sm:text-sm font-semibold text-rose-950 tracking-tight">
          {title}
        </h3>
        <p className="text-[11px] sm:text-xs text-rose-700 leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-1.5 text-xs border-rose-200 text-rose-800 hover:bg-rose-100 hover:text-rose-950"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry Operation</span>
        </Button>
      )}
    </div>
  );
}
