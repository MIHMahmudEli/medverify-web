'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate, calculateAge } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Patient Directory
          </h1>
          <p className="text-xs text-slate-500">
            Manage patient demographic records and overseas examination profiles.
          </p>
        </div>
        <Link href="/patients/new">
          <Button variant="default" size="sm" className="gap-1.5">
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
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Patient Table Card */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading patients...</div>
          ) : patients.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Users className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No patients found</p>
              <p className="text-[11px] text-slate-400">
                {search ? 'Try adjusting your search criteria.' : 'Get started by creating a patient record.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Passport No</TableHead>
                  <TableHead>Gender / Age</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-slate-900">
                      {p.fullName}
                    </TableCell>
                    <TableCell className="font-mono text-slate-800">
                      {p.passportNumber}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {p.gender} • {calculateAge(p.dateOfBirth)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {p.nationality}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {p.country}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {p.agency || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(p.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/patients/${p.id}`}>
                        <Button variant="outline" size="sm" className="h-6.5 px-2 text-[11px] gap-1">
                          <Eye className="h-3 w-3" />
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
            <div className="flex items-center justify-between p-3 border-t border-slate-100 text-xs text-slate-500">
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
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="px-2 font-mono text-xs font-medium">
                  {meta.page} / {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta.hasNextPage}
                  onClick={() => loadPatients(meta.page + 1)}
                  className="h-7 w-7 p-0"
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
