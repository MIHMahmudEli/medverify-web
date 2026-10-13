'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  FileCheck2,
  FileSpreadsheet,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  Stethoscope,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    label: 'Medical Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    label: 'Report Templates',
    href: '/templates',
    icon: FileSpreadsheet,
    roles: ['SUPER_ADMIN', 'ADMIN', 'DOCTOR'],
  },
  {
    label: 'User Management',
    href: '/users',
    icon: ShieldCheck,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Audit Logs',
    href: '/audit-logs',
    icon: History,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-800 gap-2.5">
        <div className="h-8 w-8 rounded bg-teal-600 flex items-center justify-center text-white font-bold shadow-inner">
          <Stethoscope className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-white tracking-tight text-sm">
            MedVerify
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            Clinical Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations
        </div>
        {navItems.map((item) => {
          if (
            item.roles &&
            user?.role !== 'SUPER_ADMIN' &&
            !item.roles.includes(user?.role || '')
          ) {
            return null;
          }

          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-sm border-l-2 border-teal-500 rounded-l-none'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-teal-400' : 'text-slate-400')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex flex-col overflow-hidden mr-2">
          <span className="text-xs font-medium text-white truncate">
            {user?.fullName || 'Staff User'}
          </span>
          <span className="text-[10px] text-teal-400 truncate uppercase font-mono">
            {user?.role?.replace('_', ' ') || 'OPERATOR'}
          </span>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
