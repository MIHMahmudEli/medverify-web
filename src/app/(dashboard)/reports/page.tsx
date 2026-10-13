'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  FileDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
} from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get<any>('/reports', {
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      });
      setReports(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(1);
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports(1);
  };

  const getStatusBadge = (status: string, fitness: string) => {
    if (status === 'FINALIZED') {
      if (fitness === 'FIT') return <Badge variant="fit">FIT (FINALIZED)</Badge>;
      if (fitness === 'UNFIT') return <Badge variant="unfit">UNFIT (FINALIZED)</Badge>;
      return <Badge variant="pending">FINALIZED ({fitness})</Badge>;
    }
    if (status === 'IN_REVIEW') return <Badge variant="pending">IN REVIEW</Badge>;
    if (status === 'REVOKED') return <Badge variant="revoked">REVOKED</Badge>;
    return <Badge variant="draft">DRAFT</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Medical Reports
          </h1>
          <p className="text-xs text-slate-500">
            Pre-employment examination certificates, laboratory reports, and fitness decisions.
          </p>
        </div>
        <Link href="/reports/new">
          <Button variant="default" size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>New Medical Report</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-sm flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search by reg number, patient or passport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-800"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="FINALIZED">Finalized</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FileText className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No medical reports found</p>
              <p className="text-[11px] text-slate-400">
                {search || statusFilter ? 'Try clearing your filters.' : 'Start by generating a new report.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Passport</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Exam Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((rep) => (
                  <TableRow key={rep.id}>
                    <TableCell className="font-mono font-medium text-slate-900">
                      {rep.registrationNumber}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {rep.patient?.fullName || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700">
                      {rep.patient?.passportNumber || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {rep.patient?.country || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(rep.registeredAt)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(rep.status, rep.finalMedicalStatus)}
                    </TableCell>
                    <TableCell className="font-mono text-slate-500 text-[11px]">
                      #{rep.currentRevisionNumber}
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Link href={`/reports/${rep.id}`}>
                        <Button variant="outline" size="sm" className="h-6.5 px-2 text-[11px] gap-1">
                          <Eye className="h-3 w-3" />
                          <span>Open</span>
                        </Button>
                      </Link>
                      <Link href={`/reports/${rep.id}/preview`}>
                        <Button variant="ghost" size="sm" className="h-6.5 px-2 text-[11px] gap-1 text-slate-600 hover:text-slate-900">
                          <FileDown className="h-3 w-3" />
                          <span>PDF</span>
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
                  onClick={() => loadReports(meta.page - 1)}
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
                  onClick={() => loadReports(meta.page + 1)}
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
