'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const paths = pathname ? pathname.split('/').filter(Boolean) : [];

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
        <span className="text-slate-400">Portal</span>
        {paths.map((p, idx) => {
          const isLast = idx === paths.length - 1;
          const formatted = p.charAt(0).toUpperCase() + p.slice(1);
          return (
            <React.Fragment key={p}>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className={isLast ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
                {formatted}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* Right meta */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Connected</span>
        </div>
        <div className="text-xs text-slate-500">
          <span className="text-slate-700 font-medium">{user?.department || 'Diagnostic Ops'}</span>
        </div>
      </div>
    </header>
  );
}
