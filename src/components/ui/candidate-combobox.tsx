'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Check,
  ChevronsUpDown,
  User,
  X,
  Plus,
  Globe,
  FileText,
  UserSearch,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Candidate {
  id: string;
  fullName: string;
  passportNumber: string;
  country?: string;
  nationality?: string;
  gender?: string;
  dateOfBirth?: string;
  agency?: string;
  photoUrl?: string;
}

interface CandidateComboboxProps {
  candidates: Candidate[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

export function CandidateCombobox({
  candidates = [],
  selectedId,
  onSelect,
  disabled = false,
  error,
  placeholder = 'Search candidate by name, passport, country...',
}: CandidateComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  // Close when clicking outside
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const filteredCandidates = candidates.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.passportNumber?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q) ||
      c.nationality?.toLowerCase().includes(q) ||
      c.agency?.toLowerCase().includes(q)
    );
  });

  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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
        {selectedCandidate ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {getInitials(selectedCandidate.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900 uppercase truncate">
                  {selectedCandidate.fullName}
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {selectedCandidate.passportNumber}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {selectedCandidate.country ? `Destination: ${selectedCandidate.country}` : 'Candidate profile verified'}
                {selectedCandidate.gender ? ` • ${selectedCandidate.gender}` : ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <UserSearch className="h-4 w-4 text-slate-400" />
            <span className="truncate">{placeholder}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
          {selectedCandidate && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelect('');
              }}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear candidate selection"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
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
                placeholder="Type name, passport #, country to filter..."
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

          {/* List of Candidates */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100/60">
            {filteredCandidates.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <UserSearch className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No matching candidate found</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {query
                    ? `No candidate matches "${query}". Register them first to create their report.`
                    : 'No candidates registered in database.'}
                </p>
              </div>
            ) : (
              filteredCandidates.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelect(c.id);
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
                      <div
                        className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors',
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        )}
                      >
                        {getInitials(c.fullName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 uppercase truncate">
                            {c.fullName}
                          </span>
                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {c.passportNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                          {c.country && (
                            <span className="flex items-center gap-1 truncate">
                              <Globe className="h-3 w-3 text-slate-400" />
                              <span>{c.country}</span>
                            </span>
                          )}
                          {c.gender && <span>• {c.gender}</span>}
                          {c.agency && <span className="truncate">• Agency: {c.agency}</span>}
                        </div>
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
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </span>
            <Link
              href="/patients/new"
              target="_blank"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 hover:underline"
            >
              <Plus className="h-3 w-3" />
              <span>Register New Candidate</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
