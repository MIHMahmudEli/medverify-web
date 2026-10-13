'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  backLabel,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2 pb-4 border-b border-slate-200/90', className)}>
      {/* Optional Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium overflow-x-auto pb-0.5">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-900 transition-colors whitespace-nowrap"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'whitespace-nowrap',
                      isLast ? 'text-slate-900 font-semibold' : 'text-slate-500'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Title Row & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          {backHref && (
            <Link href={backHref} aria-label={backLabel || 'Go back'}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              {badge}
            </div>
            {description && (
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
