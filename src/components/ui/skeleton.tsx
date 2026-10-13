import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-md', className)}
      {...props}
    />
  );
}

/**
 * Metric Cards Skeleton (KPI row)
 */
export function MetricCardsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-fadeInFast">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-3 bg-white border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-2.5 w-24" />
        </Card>
      ))}
    </div>
  );
}

/**
 * Clinical Table Skeleton
 */
export function TableSkeleton({
  rows = 5,
  cols = 7,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="w-full bg-white rounded-md border border-slate-200 overflow-hidden shadow-xs animate-fadeInFast">
      {/* Table Header skeleton */}
      <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-3.5',
              i === 0 ? 'w-24' : i === 1 ? 'w-32' : i === cols - 1 ? 'w-16 ml-auto' : 'w-20'
            )}
          />
        ))}
      </div>

      {/* Table Rows skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="h-12 px-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
          >
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={cn(
                  'h-3',
                  cIdx === 0
                    ? 'w-28 font-mono'
                    : cIdx === 1
                      ? 'w-36 font-semibold'
                      : cIdx === 2
                        ? 'w-24'
                        : cIdx === 3
                          ? 'w-20'
                          : cIdx === cols - 2
                            ? 'h-5 w-20 rounded-full'
                            : cIdx === cols - 1
                              ? 'h-6 w-14 ml-auto rounded'
                              : 'w-16'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full Report Detail Skeleton
 */
export function ReportDetailSkeleton() {
  return (
    <div className="space-y-4 max-w-6xl mx-auto animate-fadeInFast">
      {/* Top Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32 font-mono" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded" />
          <Skeleton className="h-8 w-28 rounded" />
        </div>
      </div>

      {/* Patient Demographic Banner skeleton */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-3.5 flex items-center gap-4">
          <Skeleton className="w-16 h-20 rounded border border-slate-200 flex-shrink-0" />
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 flex-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column Table skeleton */}
        <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
          <div className="h-9 bg-slate-900 px-4 flex items-center justify-center">
            <Skeleton className="h-3.5 w-40 bg-slate-700" />
          </div>
          <div className="p-3 space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column Table skeleton */}
        <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
          <div className="h-9 bg-slate-900 px-4 flex items-center justify-center">
            <Skeleton className="h-3.5 w-48 bg-slate-700" />
          </div>
          <div className="p-3 space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Summary & QR Verification Box skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 bg-white border-slate-200 p-4 space-y-3">
          <Skeleton className="h-3.5 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-3 w-64" />
        </Card>

        <Card className="bg-white border-slate-200 p-4 flex flex-col items-center justify-center space-y-2">
          <Skeleton className="h-24 w-24 rounded border border-slate-200" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </Card>
      </div>
    </div>
  );
}

/**
 * Patient Profile Skeleton
 */
export function PatientProfileSkeleton() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-fadeInFast">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded" />
          <Skeleton className="h-8 w-36 rounded" />
        </div>
      </div>

      <Card className="bg-white border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-5">
          <Skeleton className="w-24 h-28 rounded border border-slate-300 flex-shrink-0" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <TableSkeleton rows={4} cols={6} />
    </div>
  );
}

/**
 * Public Certificate Skeleton
 */
export function CertificateSkeleton() {
  return (
    <div className="w-full max-w-lg space-y-4 animate-fadeInFast">
      <div className="flex flex-col items-center text-center space-y-1">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-3 w-48" />
      </div>

      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-full bg-slate-700" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-44 bg-slate-700" />
            <Skeleton className="h-2.5 w-32 bg-slate-700" />
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="p-3 rounded border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-28 font-mono" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          <Skeleton className="h-9 w-full rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
