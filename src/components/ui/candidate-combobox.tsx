'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Check,
  ChevronsUpDown,
  X,
  Plus,
  Globe,
  UserSearch,
  CheckCircle2,
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
  id?: string;
}

export function CandidateCombobox({
  candidates = [],
  selectedId,
  onSelect,
  disabled = false,
  error,
  placeholder = 'Type candidate name or passport number...',
  id,
}: CandidateComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCandidate = candidates.find((c) => c.id === selectedId);

  const [query, setQuery] = useState(selectedCandidate ? selectedCandidate.fullName : '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Keep query in sync when selectedId changes externally
  useEffect(() => {
    if (selectedCandidate) {
      setQuery(selectedCandidate.fullName);
    } else if (!selectedId) {
      setQuery('');
    }
  }, [selectedId, selectedCandidate]);

  const filteredCandidates = candidates.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.passportNumber?.toLowerCase().includes(q) ||
      c.country?.toLowerCase().includes(q) ||
      c.agency?.toLowerCase().includes(q)
    );
  });

  // Reset highlight index when filtered list changes or closes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredCandidates.length, isOpen]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If user typed something but didn't pick from dropdown, revert to selected candidate
        if (selectedCandidate) {
          setQuery(selectedCandidate.fullName);
        } else {
          setQuery('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedCandidate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    // If user edits text away from currently selected candidate, clear selectedId
    if (selectedCandidate && val.trim().toLowerCase() !== selectedCandidate.fullName.toLowerCase()) {
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
          prev < filteredCandidates.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCandidates.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      if (isOpen && filteredCandidates.length > 0) {
        e.preventDefault();
        const target =
          highlightedIndex >= 0
            ? filteredCandidates[highlightedIndex]
            : filteredCandidates[0];
        if (target) {
          handleSelectCandidate(target);
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectCandidate = (c: Candidate) => {
    onSelect(c.id);
    setQuery(c.fullName);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect('');
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isConfirmedSelection = Boolean(selectedCandidate && selectedCandidate.id === selectedId);

  return (
    <div className={cn('relative w-full', isOpen ? 'z-50' : 'z-10')} ref={containerRef}>
      {/* Inline Typeahead Input Field */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          {isConfirmedSelection ? (
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          ) : (
            <User className="h-4 w-4 text-slate-400" />
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

        {/* Right side controls: passport pill + clear or chevron */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isConfirmedSelection && selectedCandidate && (
            <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200 uppercase">
              {selectedCandidate.passportNumber}
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
              {filteredCandidates.length === 0
                ? 'No matching candidates'
                : `Suggested candidates (${filteredCandidates.length}) — click to select`}
            </span>
            <span className="text-[10px] text-teal-700 font-semibold uppercase">Selection Required</span>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100/60">
            {filteredCandidates.length === 0 ? (
              <div className="py-6 px-4 text-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <UserSearch className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  No candidate matches &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Candidates must be registered before creating a report.
                </p>
              </div>
            ) : (
              filteredCandidates.map((c, index) => {
                const isSelected = c.id === selectedId;
                const isHighlighted = highlightedIndex === index;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur before click registers
                      handleSelectCandidate(c);
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
                          {c.agency && <span className="truncate">• {c.agency}</span>}
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

          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">
              {candidates.length} registered candidates
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
