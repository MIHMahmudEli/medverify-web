'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
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
  CheckCircle2,
  Clock,
  FileSpreadsheet,
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

  const statusTabs = [
    { label: 'All Reports', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Finalized', value: 'FINALIZED' },
    { label: 'Revoked', value: 'REVOKED' },
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Medical Reports
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
              {meta.total} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-employment examination certificates, laboratory reports, and fitness decisions.
          </p>
        </div>
        <Link href="/reports/new">
          <Button variant="default" size="sm" className="gap-1.5 shadow-subtle hover:shadow-card transition-all">
            <Plus className="h-3.5 w-3.5" />
            <span>New Medical Report</span>
          </Button>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 border border-slate-200/60 rounded-lg text-xs overflow-x-auto">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 rounded-md font-medium transition-clinical whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search reg number, patient or passport..."
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

      {/* Reports Table Card */}
      <Card className="bg-white border-slate-200/80 shadow-subtle rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={8} cols={8} />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">No medical reports found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {search || statusFilter ? 'Try clearing your search query or filter.' : 'Generate your first pre-employment medical report.'}
                </p>
              </div>
              {(search || statusFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                  }}
                  className="text-xs h-7"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow className="border-slate-200/80">
                  <TableHead className="font-semibold text-slate-700">Registration No</TableHead>
                  <TableHead className="font-semibold text-slate-700">Patient Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Passport</TableHead>
                  <TableHead className="font-semibold text-slate-700">Destination</TableHead>
                  <TableHead className="font-semibold text-slate-700">Exam Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Revision</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((rep) => (
                  <TableRow
                    key={rep.id}
                    className="hover:bg-slate-50/70 border-slate-100 transition-clinical group"
                  >
                    <TableCell className="font-mono font-medium text-slate-900 text-xs">
                      {rep.registrationNumber}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 text-xs">
                      {rep.patient?.fullName || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700 text-xs">
                      {rep.patient?.passportNumber || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {rep.patient?.country || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {formatDate(rep.registeredAt)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(rep.status, rep.finalMedicalStatus)}
                    </TableCell>
                    <TableCell className="font-mono text-slate-500 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/50">
                        #{rep.currentRevisionNumber}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Link href={`/reports/${rep.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px] gap-1 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                        >
                          <Eye className="h-3 w-3 text-slate-500" />
                          <span>View</span>
                        </Button>
                      </Link>
                      <Link href={`/reports/${rep.id}/preview`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] gap-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                        >
                          <FileDown className="h-3 w-3 text-slate-500" />
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
                  onClick={() => loadReports(meta.page - 1)}
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
                  onClick={() => loadReports(meta.page + 1)}
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

