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
  ExternalLink,
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
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-fadeInFast"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-250 ease-in-out md:static md:translate-x-0 select-none shadow-xl md:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 group transition-transform active:scale-[0.98]"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md group-hover:shadow-teal-500/20 transition-all">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-sm font-sans">
                  MedVerify
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Clinical Portal
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
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
                          'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                          isActive
                            ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-teal-400 rounded-l-none'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={cn(
                              'h-4 w-4 transition-colors',
                              isActive
                                ? 'text-teal-400'
                                : 'text-slate-400 group-hover:text-slate-200'
                            )}
                          />
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-slate-700 text-slate-300">
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

        {/* User Card & Sign Out */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-teal-600/30 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {getInitials(user?.fullName)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.fullName || 'Clinical User'}
                </span>
                <span className="text-[10px] text-teal-400 truncate uppercase font-mono tracking-wider">
                  {user?.role?.replace('_', ' ') || 'STAFF'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out of MedVerify"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/80 transition-colors"
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
