'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDate, calculateAge } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ModalPortal } from '@/components/ui/modal-portal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  MapPin,
  Calendar,
  Building,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface Patient {
  id: string;
  fullName: string;
  passportNumber: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  country: string;
  agency?: string;
  phone?: string;
  photoUrl?: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: Patient[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse['meta']>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/patients/${patientToDelete.id}`);
      setPatientToDelete(null);
      await loadPatients(meta.page, search);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete candidate record');
    } finally {
      setDeleting(false);
    }
  };

  const loadPatients = async (page = 1, searchTerm = search) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<PaginatedResponse>('/patients', {
        page,
        limit: 10,
        search: searchTerm,
      });
      setPatients(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients(1, search);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients(1, search);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Patient Directory"
        description="Overseas employment candidates, medical demographic profiles, and passport records."
        badge={
          <span className="px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {meta.total} candidates
          </span>
        }
        actions={
          <Link href="/patients/new">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold active:scale-95 transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register New Patient</span>
            </Button>
          </Link>
        }
      />

      {/* Search & Filter Bar */}
      <SearchFilterBar
        value={search}
        onChange={setSearch}
        onSubmit={handleSearchSubmit}
        placeholder="Search by candidate name, passport, agency..."
        countLabel={`Showing page ${meta.page} of ${meta.totalPages}`}
      />

      {/* Main Content Area */}
      {error ? (
        <ErrorState message={error} onRetry={() => loadPatients(meta.page, search)} />
      ) : loading ? (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden p-4">
          <TableSkeleton rows={8} cols={7} />
        </Card>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No matching patients found' : 'No patients registered yet'}
          description={
            search
              ? 'No candidate records match your query. Try clearing the search.'
              : 'Get started by creating your first candidate record for pre-employment examination.'
          }
          action={
            search ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  loadPatients(1, '');
                }}
                className="text-xs rounded-lg"
              >
                Clear Search
              </Button>
            ) : (
              <Link href="/patients/new">
                <Button size="sm" className="gap-1.5 text-xs rounded-lg">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Register Patient</span>
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 border-slate-200 hover:bg-slate-50/70">
                    <TableHead className="text-xs font-semibold text-slate-700 pl-6">
                      Candidate Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Passport No
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Gender / Age
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Nationality
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Destination
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Agency
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Registered
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-700 pr-6">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((p) => (
                    <TableRow
                      key={p.id}
                      className="hover:bg-slate-50/80 border-slate-100 transition-colors group"
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getInitials(p.fullName)}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 uppercase block">
                              {p.fullName}
                            </span>
                            {p.phone && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {p.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-800 uppercase">
                        {p.passportNumber}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {p.gender} • {calculateAge(p.dateOfBirth)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 uppercase">
                        {p.nationality}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium uppercase">
                        {p.country}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {p.agency || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(p.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/patients/${p.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[11px] gap-1 rounded-lg hover:border-slate-400"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Details</span>
                            </Button>
                          </Link>
                          {user?.role === 'SUPER_ADMIN' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteError(null);
                                setPatientToDelete(p);
                              }}
                              className="h-7 px-2 text-[11px] gap-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete Candidate Profile"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Responsive Cards View (APK Native Style) */}
            <div className="md:hidden p-3 space-y-3">
              {patients.map((p) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  className="block p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 active:scale-[0.98] transition-all hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                        {getInitials(p.fullName)}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 uppercase block tracking-tight">
                          {p.fullName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-teal-700 font-bold uppercase">
                            {p.passportNumber}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] font-semibold text-slate-600 uppercase">
                            {p.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    {user?.role === 'SUPER_ADMIN' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteError(null);
                          setPatientToDelete(p);
                        }}
                        className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors flex-shrink-0"
                        title="Delete Candidate Profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Demographics</span>
                      <span className="font-medium text-slate-800">{calculateAge(p.dateOfBirth)} • {p.gender}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Agency</span>
                      <span className="font-medium text-slate-800 truncate block">{p.agency || 'Direct'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Added: {formatDate(p.createdAt)}</span>
                    <span className="text-teal-700 font-semibold flex items-center gap-1">
                      View Profile
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50/60 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Showing {patients.length} of {meta.total} records
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasPreviousPage}
                    onClick={() => loadPatients(meta.page - 1, search)}
                    className="h-8 px-2.5 text-xs rounded-lg"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    <span>Previous</span>
                  </Button>

                  <span className="text-xs font-semibold text-slate-700 px-2">
                    {meta.page} / {meta.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasNextPage}
                    onClick={() => loadPatients(meta.page + 1, search)}
                    className="h-8 px-2.5 text-xs rounded-lg"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SUPER ADMIN DELETE CONFIRMATION MODAL */}
      {patientToDelete && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="max-w-md w-full bg-white shadow-2xl rounded-2xl border border-rose-200 animate-in zoom-in-95 duration-200 overflow-hidden">
              <CardHeader className="bg-rose-50/70 border-b border-rose-100 pb-3">
                <CardTitle className="text-base font-bold text-rose-800 flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-rose-600" />
                  <span>Delete Candidate Profile</span>
                </CardTitle>
                <CardDescription className="text-xs text-rose-600/90">
                  Irreversible Super Admin Action: Permanently removes candidate profile and all associated reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {deleteError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fadeInFast"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 font-semibold leading-snug">{deleteError}</div>
                  </div>
                )}

                <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100 text-xs text-slate-700 space-y-2">
                  <p>
                    Are you sure you want to permanently delete candidate{' '}
                    <strong className="text-slate-900 font-bold uppercase">{patientToDelete.fullName}</strong>{' '}
                    (Passport:{' '}
                    <span className="font-mono font-bold text-slate-900">{patientToDelete.passportNumber}</span>)?
                  </p>
                  <p className="text-rose-700 font-medium text-[11px]">
                    ⚠️ This will immediately purge all clinical examination reports, revision records, verified certificates, and tokens linked to this candidate. This action cannot be undone.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-3.5 px-5 bg-slate-50/60 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  onClick={() => setPatientToDelete(null)}
                  className="h-9 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleting}
                  onClick={handleDeletePatient}
                  className="h-9 text-xs rounded-xl font-semibold shadow-2xs gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{deleting ? 'Deleting...' : 'Confirm Permanent Deletion'}</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

