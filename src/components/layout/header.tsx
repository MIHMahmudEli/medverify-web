'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ChevronRight, Menu, Plus, UserPlus, FilePlus } from 'lucide-react';
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
    // If it's a UUID or id
    if (segment.length > 15) return `#${segment.substring(0, 8)}...`;
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-10 sticky top-0 backdrop-blur-md bg-white/95">
      {/* Left: Mobile Menu Button & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium overflow-x-auto py-1">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-700 transition-colors hidden sm:inline-block"
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
                  <span className="text-slate-900 font-semibold truncate max-w-[140px] sm:max-w-none">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-slate-900 transition-colors truncate max-w-[100px] sm:max-w-none"
                  >
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Quick Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Link href="/patients/new">
            <Button
              variant="outline"
              size="sm"
              className="h-7.5 px-2.5 text-[11px] gap-1 rounded-lg border-slate-200 text-slate-700 hover:border-slate-300"
            >
              <UserPlus className="h-3.5 w-3.5 text-slate-500" />
              <span>Register</span>
            </Button>
          </Link>

          <Link href="/reports/new">
            <Button
              variant="default"
              size="sm"
              className="h-7.5 px-2.5 text-[11px] gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xs"
            >
              <FilePlus className="h-3.5 w-3.5" />
              <span>Report</span>
            </Button>
          </Link>
        </div>

        {/* Department Badge */}
        <div className="hidden lg:block text-xs text-slate-500 pl-1 border-l border-slate-200">
          <span className="text-slate-700 font-medium">
            {user?.department || 'Clinical Operations'}
          </span>
        </div>
      </div>
    </header>
  );
}
