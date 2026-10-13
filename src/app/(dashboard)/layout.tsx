'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar skeleton */}
        <div className="w-60 bg-slate-900 border-r border-slate-800 p-4 space-y-4 hidden md:block">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded bg-slate-800" />
            <Skeleton className="h-4 w-28 bg-slate-800" />
          </div>
          <div className="space-y-2 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full bg-slate-800/60 rounded" />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded" />
          </div>
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-32 rounded" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-md" />
                ))}
              </div>
              <Skeleton className="h-72 rounded-md" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via AuthProvider
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 transition-colors">
          <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
