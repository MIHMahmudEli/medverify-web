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
  FileSpreadsheet,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  Stethoscope,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Operations',
    items: [
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
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'User Directory',
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
    ],
  },
];

export interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'MV';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 md:hidden animate-fadeInFast"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container (Clean White Theme) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white text-slate-700 flex flex-col border-r border-slate-200/90 transition-transform duration-250 ease-in-out md:static md:translate-x-0 select-none shadow-xl md:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 group transition-transform active:scale-[0.98]"
          >
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 shadow-xs group-hover:scale-105 transition-all">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base font-sans">
                  Med<span className="text-teal-600">Verify</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                  Enterprise
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                Clinical Portal
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 md:hidden transition-colors"
              aria-label="Close sidebar navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (!item.roles) return true;
              if (user?.role === 'SUPER_ADMIN') return true;
              return item.roles.includes(user?.role || '');
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <div className="px-3 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                  {group.title}
                </div>

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group active:scale-[0.98]',
                          isActive
                            ? 'bg-teal-50 text-teal-800 font-bold shadow-2xs border-l-3 border-teal-600'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={cn(
                              'h-4 w-4 transition-colors',
                              isActive
                                ? 'text-teal-600 stroke-[2.2]'
                                : 'text-slate-400 group-hover:text-slate-700'
                            )}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Card & Sign Out (White Theme) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {getInitials(user?.fullName)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {user?.fullName || 'Clinical User'}
                </span>
                <span className="text-[10px] text-teal-700 truncate uppercase font-mono font-bold tracking-wider">
                  {user?.role?.replace('_', ' ') || 'STAFF'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out of MedVerify"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
