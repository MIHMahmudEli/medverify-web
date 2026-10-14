'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
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
  FilePlus,
  Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [error, setError] = useState<string | null>(null);

  const loadReports = async (page = 1, currentFilter = statusFilter, searchTerm = search) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>('/reports', {
        page,
        limit: 10,
        search: searchTerm || undefined,
        status: currentFilter || undefined,
      });
      setReports(res.data);
      setMeta(res.meta);
    } catch (err: any) {
      setError(err.message || 'Failed to load medical reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(1, statusFilter, search);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports(1, statusFilter, search);
  };

  const handleTabChange = (val: string) => {
    setStatusFilter(val);
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
    <div className="space-y-5 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Medical Examination Reports"
        description="Comprehensive clinical assessments, laboratory investigations, radiological findings, and verified certificates."
        badge={
          <span className="px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {meta.total} reports
          </span>
        }
        actions={
          <Link href="/reports/new">
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold active:scale-95 transition-all"
            >
              <FilePlus className="h-3.5 w-3.5" />
              <span>New Medical Report</span>
            </Button>
          </Link>
        }
      />

      {/* Filter Tabs and Search Bar */}
      <div className="space-y-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shadow-2xs active:scale-95',
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <SearchFilterBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSearchSubmit}
          placeholder="Search by registration number, candidate name, or passport..."
          countLabel={`Showing page ${meta.page} of ${meta.totalPages}`}
        />
      </div>

      {/* Main Content Area */}
      {error ? (
        <ErrorState message={error} onRetry={() => loadReports(meta.page, statusFilter, search)} />
      ) : loading ? (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden p-4">
          <TableSkeleton rows={8} cols={8} />
        </Card>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={statusFilter ? `No ${statusFilter.toLowerCase()} reports found` : 'No reports found'}
          description={
            search || statusFilter
              ? 'No medical reports match your filter criteria. Try resetting your search or status.'
              : 'Start by creating your first clinical examination report.'
          }
          action={
            search || statusFilter ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                }}
                className="text-xs rounded-lg"
              >
                Reset Filters
              </Button>
            ) : (
              <Link href="/reports/new">
                <Button size="sm" className="gap-1.5 text-xs rounded-lg">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create First Report</span>
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
                      Reg Number
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Candidate Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Passport No
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Destination
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Reviewer
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-700 pr-6">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="hover:bg-slate-50/80 border-slate-100 transition-colors group"
                    >
                      <TableCell className="font-mono text-xs font-bold text-slate-900 pl-6">
                        {report.registrationNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-slate-900 uppercase">
                        {report.patient?.fullName || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600 uppercase">
                        {report.patient?.passportNumber || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 uppercase">
                        {report.patient?.country || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {formatDate(report.registeredAt || report.createdAt)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status, report.finalMedicalStatus)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {report.finalizedBy?.fullName || '—'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/reports/${report.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[11px] gap-1 rounded-lg hover:border-slate-400"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View</span>
                            </Button>
                          </Link>
                          {report.status === 'FINALIZED' && (
                            <Link href={`/reports/${report.id}/preview`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[11px] gap-1 rounded-lg text-slate-600 hover:text-slate-900"
                                title="Print / PDF Preview"
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                            </Link>
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
              {reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="block p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 active:scale-[0.98] transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      <span className="font-mono text-xs font-bold text-slate-800 tracking-tight">
                        {report.registrationNumber}
                      </span>
                    </div>
                    {getStatusBadge(report.status, report.finalMedicalStatus)}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-slate-900 uppercase block tracking-tight truncate">
                        {report.patient?.fullName || 'Candidate'}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs text-teal-700 font-bold uppercase">
                          {report.patient?.passportNumber || '—'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-semibold text-slate-600 uppercase">
                          {report.patient?.country || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Exam: {formatDate(report.registeredAt || report.createdAt)}</span>
                    <span className="text-teal-700 font-semibold flex items-center gap-1">
                      Review Record
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
                  Showing {reports.length} of {meta.total} reports
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasPreviousPage}
                    onClick={() => loadReports(meta.page - 1, statusFilter, search)}
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
                    onClick={() => loadReports(meta.page + 1, statusFilter, search)}
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
    </div>
  );
}
