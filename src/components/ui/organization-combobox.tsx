'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Check,
  ChevronsUpDown,
  Building2,
  X,
  Plus,
  Star,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface OrganizationOption {
  id: string;
  orgName: string;
  orgCode: string;
  orgAddress?: string;
  orgAddressLine2?: string;
  logoUrl?: string;
  reportHeaderTitle?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

interface OrganizationComboboxProps {
  organizations: OrganizationOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function OrganizationCombobox({
  organizations = [],
  selectedId,
  onSelect,
  disabled = false,
  error,
  placeholder = 'Select clinical facility...',
}: OrganizationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOrg = organizations.find((o) => o.id === selectedId);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Focus search input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const filteredOrgs = organizations.filter((o) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      o.orgName?.toLowerCase().includes(q) ||
      o.orgCode?.toLowerCase().includes(q) ||
      o.orgAddress?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          'w-full min-h-[44px] px-3 py-2 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all bg-white shadow-2xs group',
          open
            ? 'border-teal-500 ring-2 ring-teal-500/20'
            : error
            ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-50'
        )}
      >
        {selectedOrg ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {selectedOrg.logoUrl ? (
                <img
                  src={selectedOrg.logoUrl}
                  alt={selectedOrg.orgName}
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                <Building2 className="h-4 w-4 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {selectedOrg.orgName}
                </span>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {selectedOrg.orgCode}
                </span>
                {selectedOrg.isDefault && (
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                    <Star className="h-2.5 w-2.5 fill-emerald-600 text-emerald-600" />
                    Default
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {selectedOrg.reportHeaderTitle || selectedOrg.orgAddress || 'Official Diagnostic Center'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="truncate">{placeholder}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
          <ChevronsUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </button>

      {/* Floating Dropdown Panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-scaleIn">
          {/* Search Header */}
          <div className="p-2.5 bg-slate-50/80 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by facility name, code prefix..."
                className="w-full pl-8.5 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all shadow-2xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Organizations */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100/60">
            {filteredOrgs.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Building2 className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No matching facility found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {query
                    ? `No organization matches "${query}". Register the center first.`
                    : 'No organizations registered.'}
                </p>
              </div>
            ) : (
              filteredOrgs.map((org) => {
                const isSelected = org.id === selectedId;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      onSelect(org.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 group',
                      isSelected
                        ? 'bg-teal-50/80 text-teal-950 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                        {org.logoUrl ? (
                          <img
                            src={org.logoUrl}
                            alt={org.orgName}
                            className="h-full w-full object-contain p-0.5"
                          />
                        ) : (
                          <Building2 className="h-4 w-4 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {org.orgName}
                          </span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                            {org.orgCode}
                          </span>
                          {org.isDefault && (
                            <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                              <Star className="h-2.5 w-2.5 fill-emerald-600 text-emerald-600" />
                              Default Facility
                            </span>
                          )}
                        </div>
                        {org.orgAddress && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{org.orgAddress}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Footer Action */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              {organizations.length} Clinical Facilities Available
            </span>
            <Link
              href="/organizations/new"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline"
            >
              <Plus className="h-3 w-3" />
              <span>Register New Facility</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
