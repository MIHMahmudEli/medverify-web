'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate, calculateAge } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Plus, Search, Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const loadPatients = async (page = 1, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse>('/patients', {
        page,
        limit: 10,
        search: searchTerm,
      });
      setPatients(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients(1, search);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients(1, search);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Patient Directory
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              {meta.total} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage patient demographic records and overseas examination profiles.
          </p>
        </div>
        <Link href="/patients/new">
          <Button variant="default" size="sm" className="gap-1.5 shadow-subtle hover:shadow-card transition-all">
            <Plus className="h-3.5 w-3.5" />
            <span>Register New Patient</span>
          </Button>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex-1 max-w-sm flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search by name, passport, or agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 transition-clinical"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-8 text-xs px-3">
            Search
          </Button>
        </form>
      </div>

      {/* Patient Table Card */}
      <Card className="bg-white border-slate-200/80 shadow-subtle rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={8} cols={8} />
            </div>
          ) : patients.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">No patients found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {search ? 'Try adjusting your search criteria.' : 'Get started by creating a patient record.'}
                </p>
              </div>
              {search && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    loadPatients(1, '');
                  }}
                  className="text-xs h-7"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-200/80">
                  <TableHead className="font-semibold text-slate-700">Full Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Passport No</TableHead>
                  <TableHead className="font-semibold text-slate-700">Gender / Age</TableHead>
                  <TableHead className="font-semibold text-slate-700">Nationality</TableHead>
                  <TableHead className="font-semibold text-slate-700">Destination</TableHead>
                  <TableHead className="font-semibold text-slate-700">Agency</TableHead>
                  <TableHead className="font-semibold text-slate-700">Registered</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow
                    key={p.id}
                    className="hover:bg-slate-50/70 border-slate-100 transition-clinical group"
                  >
                    <TableCell className="font-medium text-slate-900 text-xs">
                      {p.fullName}
                    </TableCell>
                    <TableCell className="font-mono text-slate-800 text-xs">
                      {p.passportNumber}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {p.gender} • {calculateAge(p.dateOfBirth)}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {p.nationality}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {p.country}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {p.agency || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {formatDate(p.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/patients/${p.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] gap-1 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                        >
                          <Eye className="h-3 w-3 text-slate-500" />
                          <span>View</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between p-3.5 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-500">
              <span>
                Showing {((meta.page - 1) * meta.limit) + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} records
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => loadPatients(meta.page - 1)}
                  className="h-7 w-7 p-0 border-slate-200"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-2 font-mono text-xs font-semibold text-slate-700">
                  {meta.page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() => loadPatients(meta.page + 1)}
                  className="h-7 w-7 p-0 border-slate-200"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
