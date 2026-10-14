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
 * Public Verification Page & Certificate Skeleton (Exact UI match to /verify/[token])
 */
export function VerifyPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-200/80 py-8 px-2 sm:px-4 flex flex-col items-center font-sans animate-fadeInFast w-full">
      {/* 1. TOP STICKY ACTION HEADER SKELETON */}
      <div className="w-full max-w-4xl space-y-3 mb-6">
        <div className="p-4 bg-gradient-to-r from-slate-800 via-slate-850 to-slate-900 rounded-xl shadow-md flex items-center justify-between gap-3 border border-slate-700">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-700/80 flex-shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton className="h-4 w-40 sm:w-64 bg-slate-700/80" />
                <Skeleton className="h-4 w-20 rounded-full bg-slate-700/80" />
              </div>
              <Skeleton className="h-3 w-48 sm:w-80 bg-slate-700/60" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Skeleton className="h-8 w-8 sm:w-44 rounded-md bg-slate-700/80" />
          </div>
        </div>
      </div>

      {/* 2. PAGE 1: OFFICIAL MEDICAL FITNESS CERTIFICATE SKELETON */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm border border-slate-300 p-4 sm:p-8 relative">
        <div className="border-[2px] border-[#1e3a5f]/30 p-4 sm:p-6 relative rounded-sm space-y-4">
          <div className="absolute inset-1.5 border border-[#c5a059]/30 pointer-events-none rounded-2xs" />
          <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-[#c5a059]/40 pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-[#c5a059]/40 pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-[#c5a059]/40 pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-[#c5a059]/40 pointer-events-none" />

          {/* INSTITUTIONAL HEADER */}
          <div className="text-center space-y-1.5 pb-2">
            <Skeleton className="h-6 w-56 sm:w-72 mx-auto bg-slate-200" />
            <Skeleton className="h-3 w-72 sm:w-96 mx-auto bg-slate-200" />
            <Skeleton className="h-2.5 w-60 sm:w-80 mx-auto bg-slate-200" />
            <div className="w-56 h-[1px] bg-[#c5a059]/30 mx-auto mt-2" />
          </div>

          {/* CERTIFICATE TITLE BOX */}
          <div className="my-2.5 text-center">
            <div className="inline-block border border-[#1e3a5f]/20 bg-[#f8fafc] px-6 py-2.5 w-full max-w-xl text-center rounded-2xs space-y-1.5">
              <Skeleton className="h-4 w-48 sm:w-64 mx-auto bg-slate-300" />
              <Skeleton className="h-2.5 w-64 sm:w-80 mx-auto bg-slate-200" />
            </div>
          </div>

          {/* CERTIFICATE METADATA STRIP (4 EQUAL COLUMNS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5 p-2 bg-[#f8fafc] border border-slate-300 rounded-2xs">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-2.5 w-20 bg-slate-200" />
                <Skeleton className="h-3.5 w-28 bg-slate-300" />
              </div>
            ))}
          </div>

          {/* CANDIDATE IDENTITY SECTION */}
          <div className="my-2.5 space-y-1">
            <Skeleton className="h-3 w-48 bg-slate-300" />
            <div className="border border-slate-300 rounded-sm grid grid-cols-1 sm:grid-cols-4 bg-white overflow-hidden">
              <div className="sm:col-span-3 p-3 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 border-b sm:border-b-0 sm:border-r border-slate-300">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-2.5 w-16 bg-slate-200" />
                    <Skeleton className="h-3.5 w-28 bg-slate-300" />
                  </div>
                ))}
              </div>
              <div className="p-2.5 flex flex-col items-center justify-center bg-slate-50">
                <Skeleton className="w-24 sm:w-28 h-28 sm:h-32 rounded border border-slate-300 bg-slate-200" />
                <Skeleton className="h-2 w-16 mt-1.5 bg-slate-200" />
              </div>
            </div>
          </div>

          {/* CLINICAL FITNESS DECLARATION */}
          <div className="my-2.5 space-y-1.5">
            <Skeleton className="h-3 w-56 bg-slate-300" />
            <div className="border border-slate-300 rounded-sm p-3 bg-slate-50/60 space-y-2.5">
              <div className="space-y-1">
                <Skeleton className="h-2.5 w-full bg-slate-200" />
                <Skeleton className="h-2.5 w-4/5 bg-slate-200" />
              </div>
              <Skeleton className="h-9 w-full rounded border-2 border-slate-300 bg-slate-100" />
              <Skeleton className="h-3 w-40 bg-slate-200" />
            </div>
          </div>

          {/* SUMMARY OF CLINICAL ASSESSMENTS */}
          <div className="my-2.5 space-y-1">
            <Skeleton className="h-3 w-64 bg-slate-300" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-2 rounded bg-slate-50 border border-slate-300 flex flex-col justify-between h-24 space-y-1">
                  <Skeleton className="h-2.5 w-20 bg-slate-300" />
                  <Skeleton className="h-2 w-full bg-slate-200" />
                  <Skeleton className="h-2.5 w-16 mx-auto bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          {/* DIGITAL AUTHENTICATION & SIGNATORY/SEAL SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 pt-1 border-t border-slate-300">
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 flex flex-col items-center justify-between text-center space-y-2">
              <Skeleton className="h-2.5 w-48 bg-slate-300" />
              <Skeleton className="w-24 h-24 bg-slate-200 rounded" />
              <Skeleton className="h-2.5 w-36 bg-slate-200" />
            </div>
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 flex flex-col justify-between space-y-2">
              <div className="text-center space-y-1.5">
                <Skeleton className="h-2.5 w-48 mx-auto bg-slate-300" />
                <Skeleton className="h-7 w-24 mx-auto bg-slate-200" />
              </div>
              <div className="border-t border-slate-300 pt-1 flex items-center justify-between gap-1">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-32 bg-slate-300" />
                  <Skeleton className="h-2.5 w-28 bg-slate-200" />
                  <Skeleton className="h-2.5 w-24 bg-slate-200" />
                </div>
                <Skeleton className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-300 pt-2 flex items-center justify-between">
            <Skeleton className="h-2.5 w-48 bg-slate-200" />
            <Skeleton className="h-2.5 w-20 bg-slate-200" />
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FLOATING ACTION BAR SKELETON */}
      <div className="w-full max-w-4xl mt-6 p-3 sm:p-4 bg-white rounded-xl shadow-md border border-slate-300 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-48 sm:w-72 bg-slate-200" />
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Skeleton className="h-8 w-8 sm:w-44 rounded-md bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export const CertificateSkeleton = VerifyPageSkeleton;
