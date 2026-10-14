'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ChevronRight, Menu, Plus, UserPlus, FilePlus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const paths = pathname ? pathname.split('/').filter(Boolean) : [];

  const formatBreadcrumb = (segment: string) => {
    if (segment === 'dashboard') return 'Dashboard';
    if (segment === 'patients') return 'Patients';
    if (segment === 'reports') return 'Medical Reports';
    if (segment === 'templates') return 'Templates';
    if (segment === 'users') return 'User Directory';
    if (segment === 'audit-logs') return 'Audit Logs';
    if (segment === 'settings') return 'Settings';
    if (segment === 'new') return 'New';
    if (segment === 'edit') return 'Edit';
    if (segment === 'preview') return 'Preview';
    if (segment.length > 15) return `#${segment.substring(0, 8)}...`;
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'MV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3.5 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Left: Mobile App Branding & Desktop Breadcrumbs */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors active:scale-95"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Mobile App Title Bar */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Stethoscope className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 tracking-tight">
            Med<span className="text-teal-600">Verify</span>
          </span>
        </div>

        {/* Desktop Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500 font-medium overflow-x-auto py-1">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-700 transition-colors inline-block"
          >
            Portal
          </Link>

          {paths.map((p, idx) => {
            const isLast = idx === paths.length - 1;
            const href = '/' + paths.slice(0, idx + 1).join('/');
            const label = formatBreadcrumb(p);

            return (
              <React.Fragment key={p + idx}>
                <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
                {isLast ? (
                  <span className="text-slate-900 font-semibold truncate max-w-[200px]">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-slate-900 transition-colors truncate max-w-[120px]"
                  >
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick Actions & User Status */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Desktop Quick Action Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Link href="/patients/new">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:border-slate-300 active:scale-95 transition-all"
            >
              <UserPlus className="h-3.5 w-3.5 text-teal-600" />
              <span>Register</span>
            </Button>
          </Link>

          <Link href="/reports/new">
            <Button
              variant="default"
              size="sm"
              className="h-8 px-2.5 text-xs gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold active:scale-95 transition-all"
            >
              <FilePlus className="h-3.5 w-3.5" />
              <span>New Report</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Quick Action Pill */}
        <div className="flex sm:hidden items-center gap-1.5">
          <Link href="/patients/new">
            <Button
              variant="outline"
              size="sm"
              className="h-7.5 px-2 text-[11px] gap-1 rounded-lg border-teal-200 bg-teal-50/60 text-teal-700 hover:bg-teal-50 font-bold active:scale-95"
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </Button>
          </Link>
        </div>

        {/* User Mini Avatar / Status */}
        <div className="flex items-center gap-2 pl-1.5 border-l border-slate-200">
          <div className="h-7.5 w-7.5 sm:h-8 sm:w-8 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs select-none">
            {getInitials(user?.fullName)}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
              {user?.fullName || 'Clinical User'}
            </span>
            <span className="text-[10px] text-teal-600 font-mono font-bold uppercase leading-tight">
              {user?.role?.replace('_', ' ') || 'STAFF'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
