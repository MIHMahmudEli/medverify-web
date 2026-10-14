'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar skeleton on desktop */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 space-y-4 hidden md:block">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl bg-slate-200" />
            <Skeleton className="h-4 w-28 bg-slate-200" />
          </div>
          <div className="space-y-2 pt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-72 rounded-xl" />
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
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 pb-24 md:pb-8 bg-slate-50 transition-colors">
          <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 animate-fadeIn">
            {children}
          </div>
        </main>
        {/* Mobile Native App Bottom Navigation */}
        <BottomNav onOpenMobileMenu={() => setMobileMenuOpen(true)} />
      </div>
    </div>
  );
}
