'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Check,
  ChevronsUpDown,
  X,
  Plus,
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  id?: string;
}

export function OrganizationCombobox({
  organizations = [],
  selectedId,
  onSelect,
  disabled = false,
  error,
  placeholder = 'Type facility name or prefix code...',
  id,
}: OrganizationComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOrg = organizations.find((o) => o.id === selectedId);

  const [query, setQuery] = useState(selectedOrg ? selectedOrg.orgName : '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Sync query when selectedId changes externally
  useEffect(() => {
    if (selectedOrg) {
      setQuery(selectedOrg.orgName);
    } else if (!selectedId) {
      setQuery('');
    }
  }, [selectedId, selectedOrg]);

  const filteredOrgs = organizations.filter((o) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      o.orgName?.toLowerCase().includes(q) ||
      o.orgCode?.toLowerCase().includes(q) ||
      o.orgAddress?.toLowerCase().includes(q)
    );
  });

  // Reset highlightedIndex when filteredOrgs changes or closes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOrgs.length, isOpen]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If user typed something but didn't pick from dropdown, revert to selected org
        if (selectedOrg) {
          setQuery(selectedOrg.orgName);
        } else {
          setQuery('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedOrg]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    // If user changes text away from selected organization, clear selectedId
    if (selectedOrg && val.trim().toLowerCase() !== selectedOrg.orgName.toLowerCase()) {
      onSelect('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOrgs.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOrgs.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && filteredOrgs.length > 0) {
        e.preventDefault();
        const target =
          highlightedIndex >= 0 ? filteredOrgs[highlightedIndex] : filteredOrgs[0];
        if (target) {
          handleSelectOrg(target);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectOrg = (org: OrganizationOption) => {
    onSelect(org.id);
    setQuery(org.orgName);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect('');
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const isConfirmedSelection = Boolean(selectedOrg && selectedOrg.id === selectedId);

  return (
    <div className={cn('relative w-full', isOpen ? 'z-50' : 'z-10')} ref={containerRef}>
      {/* Inline Typeahead Input Field */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {isConfirmedSelection ? (
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          ) : (
            <Building2 className="h-4 w-4 text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="text"
          disabled={disabled}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'w-full h-11 pl-10 pr-24 text-xs rounded-xl border bg-white transition-all shadow-2xs focus:outline-none',
            isConfirmedSelection
              ? 'border-teal-500/80 bg-teal-50/20 text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500/20'
              : error
              ? 'border-rose-400 ring-2 ring-rose-400/30 bg-rose-50/20 text-slate-900'
              : 'border-slate-200 text-slate-800 placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
            disabled && 'opacity-60 cursor-not-allowed bg-slate-50'
          )}
        />

        {/* Right side controls: orgCode badge + clear or chevron */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isConfirmedSelection && selectedOrg && (
            <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
              {selectedOrg.orgCode}
            </span>
          )}

          {query && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                if (!disabled) {
                  setIsOpen((prev) => !prev);
                  inputRef.current?.focus();
                }
              }}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <ChevronsUpDown className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && !isConfirmedSelection && (
        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Suggestion Dropdown (Appears Directly as User Types) */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] bg-white rounded-2xl border border-slate-200/90 shadow-2xl ring-1 ring-slate-900/10 overflow-hidden animate-scaleIn min-w-full">
          <div className="p-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>
              {filteredOrgs.length === 0
                ? 'No matching facilities'
                : `Suggested facilities (${filteredOrgs.length}) — click to select`}
            </span>
            <span className="text-[10px] text-teal-700 font-semibold uppercase">Selection Required</span>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100/60">
            {filteredOrgs.length === 0 ? (
              <div className="py-6 px-4 text-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Building2 className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  No facility matches &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Please choose from registered clinical facilities.
                </p>
              </div>
            ) : (
              filteredOrgs.map((org, index) => {
                const isSelected = org.id === selectedId;
                const isHighlighted = highlightedIndex === index;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent blur before selection registers
                      handleSelectOrg(org);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 group',
                      isSelected
                        ? 'bg-teal-50/90 text-teal-950 font-semibold ring-1 ring-teal-500/20'
                        : isHighlighted
                        ? 'bg-slate-100/80 text-slate-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
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
                              Default
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

          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              {organizations.length} clinical centers available
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
