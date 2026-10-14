'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Menu,
  Plus,
  X,
  UserPlus,
  FilePlus,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BottomNavProps {
  onOpenMobileMenu: () => void;
}

export function BottomNav({ onOpenMobileMenu }: BottomNavProps) {
  const pathname = usePathname();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const isDashboard = pathname === '/dashboard';
  const isPatients = pathname?.startsWith('/patients');
  const isReports = pathname?.startsWith('/reports');

  return (
    <>
      {/* Mobile Quick Action Sheet Modal */}
      {quickMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-fadeInFast">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setQuickMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 pb-8 space-y-4 animate-slideUp">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Quick Clinical Actions
                </h3>
                <p className="text-xs text-slate-500">
                  Select an operation to perform immediately
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickMenuOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close action sheet"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                href="/patients/new"
                onClick={() => setQuickMenuOpen(false)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-center active:scale-95 transition-all shadow-2xs hover:bg-teal-50"
              >
                <div className="h-11 w-11 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-teal-600/30">
                  <UserPlus className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">Register Patient</span>
                <span className="text-[10px] text-teal-700 mt-0.5 font-medium">New Candidate</span>
              </Link>

              <Link
                href="/reports/new"
                onClick={() => setQuickMenuOpen(false)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 text-center active:scale-95 transition-all shadow-2xs hover:bg-cyan-50"
              >
                <div className="h-11 w-11 rounded-xl bg-cyan-600 text-white flex items-center justify-center mb-2.5 shadow-sm shadow-cyan-600/30">
                  <FilePlus className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-900">New Report</span>
                <span className="text-[10px] text-cyan-700 mt-0.5 font-medium">Lab Checkup</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around select-none"
      >
        {/* Tab 1: Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-center transition-all active:scale-95',
            isDashboard
              ? 'text-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <div className="relative">
            <LayoutDashboard className={cn('h-5 w-5', isDashboard ? 'stroke-[2.5]' : 'stroke-[1.8]')} />
            {isDashboard && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none">Dashboard</span>
        </Link>

        {/* Tab 2: Patients */}
        <Link
          href="/patients"
          className={cn(
            'flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-center transition-all active:scale-95',
            isPatients
              ? 'text-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <div className="relative">
            <Users className={cn('h-5 w-5', isPatients ? 'stroke-[2.5]' : 'stroke-[1.8]')} />
            {isPatients && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none">Patients</span>
        </Link>

        {/* Center Action FAB */}
        <div className="flex-1 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="h-12 w-12 -mt-4 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-lg shadow-teal-600/35 flex items-center justify-center active:scale-90 transition-all border-2 border-white focus:outline-none"
            aria-label="Create new record"
            aria-expanded={quickMenuOpen}
          >
            <Plus className={cn('h-6 w-6 transition-transform duration-200', quickMenuOpen && 'rotate-45')} />
          </button>
        </div>

        {/* Tab 4: Medical Reports */}
        <Link
          href="/reports"
          className={cn(
            'flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-center transition-all active:scale-95',
            isReports
              ? 'text-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <div className="relative">
            <FileText className={cn('h-5 w-5', isReports ? 'stroke-[2.5]' : 'stroke-[1.8]')} />
            {isReports && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-none">Reports</span>
        </Link>

        {/* Tab 5: Menu */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-center text-slate-500 hover:text-slate-800 transition-all active:scale-95"
          aria-label="Open clinical navigation menu"
        >
          <Menu className="h-5 w-5 stroke-[1.8]" />
          <span className="text-[10px] mt-1 leading-none">Menu</span>
        </button>
      </nav>
    </>
  );
}
