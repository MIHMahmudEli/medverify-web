'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
  countLabel?: string;
}

export function SearchFilterBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search records...',
  children,
  className,
  countLabel,
}: SearchFilterBarProps) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit) onSubmit(e);
        }}
        className="flex-1 flex items-center gap-2 max-w-md"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pl-8 pr-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-lg shadow-2xs"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="h-8 text-xs px-3 rounded-lg border border-slate-200"
        >
          Search
        </Button>
      </form>

      <div className="flex items-center gap-2 flex-wrap">
        {countLabel && (
          <span className="text-xs text-slate-500 font-medium hidden md:inline-block mr-1">
            {countLabel}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
