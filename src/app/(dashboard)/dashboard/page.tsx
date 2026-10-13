'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCardsSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
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
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Eye,
  FileCheck,
  ArrowRight,
  TrendingUp,
  Activity,
  UserPlus,
  FilePlus,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface DashboardData {
  metrics: {
    totalPatients: number;
    totalReports: number;
    draftReports: number;
    reviewReports: number;
    finalizedReports: number;
  };
  recentReports: Array<{
    id: string;
    registrationNumber: string;
    registeredAt: string;
    status: string;
    finalMedicalStatus: string;
    createdAt: string;
    patient: {
      id: string;
      fullName: string;
      passportNumber: string;
      country: string;
    };
    finalizedBy?: {
      fullName: string;
    };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardData>('/dashboard/metrics');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load clinical operations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

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
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Clinical Operations Dashboard"
        description="Real-time candidate checkup volume, doctor review queues, and verified certificates."
        badge={
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live System
          </span>
        }
        actions={
          <>
            <Link href="/patients/new">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs"
              >
                <UserPlus className="h-3.5 w-3.5 text-slate-500" />
                <span>Register Patient</span>
              </Button>
            </Link>
            <Link href="/reports/new">
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xs font-semibold"
              >
                <FilePlus className="h-3.5 w-3.5" />
                <span>New Examination Report</span>
              </Button>
            </Link>
          </>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={loadMetrics} />
      ) : loading ? (
        <MetricCardsSkeleton count={5} />
      ) : (
        /* Stat Cards */
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            label="Total Patients"
            value={data?.metrics.totalPatients ?? 0}
            subtitle="Registered candidates"
            icon={Users}
            iconClassName="bg-slate-100 text-slate-700"
          />

          <StatCard
            label="Total Reports"
            value={data?.metrics.totalReports ?? 0}
            subtitle="Clinical checkups"
            icon={FileText}
            iconClassName="bg-blue-50 text-blue-700"
          />

          <StatCard
            label="Draft Reports"
            value={data?.metrics.draftReports ?? 0}
            subtitle="Awaiting lab entries"
            icon={FileCheck}
            iconClassName="bg-slate-100 text-slate-600"
          />

          <StatCard
            label="In Review"
            value={data?.metrics.reviewReports ?? 0}
            subtitle="Doctor sign-off queue"
            icon={Clock}
            iconClassName="bg-amber-50 text-amber-700"
            accentBorder="amber"
          />

          <StatCard
            label="Finalized & QR"
            value={data?.metrics.finalizedReports ?? 0}
            subtitle="Cryptographically verified"
            icon={CheckCircle2}
            iconClassName="bg-emerald-50 text-emerald-700"
            accentBorder="emerald"
          />
        </div>
      )}

      {/* Recent Examination Reports */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-4 sm:px-6 bg-slate-50/60 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Recent Medical Examination Reports
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Live overseas fitness checkups recorded across diagnostic departments.
            </CardDescription>
          </div>
          <Link href="/reports">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={8} />
            </div>
          ) : !data?.recentReports || data.recentReports.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No examination reports recorded yet"
                description="Begin by registering a candidate and creating their initial medical checkup report."
                action={
                  <Link href="/reports/new">
                    <Button size="sm" className="gap-1.5 rounded-lg text-xs">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create First Report</span>
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-slate-200">
                      <TableHead className="text-xs font-semibold text-slate-600 pl-6">
                        Registration No
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">
                        Candidate Name
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">
                        Passport No
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">
                        Destination
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">
                        Exam Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">
                        Reviewer
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 text-right pr-6">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentReports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="hover:bg-slate-50/80 transition-colors border-slate-100 group"
                      >
                        <TableCell className="font-mono text-xs font-bold text-slate-900 pl-6">
                          {report.registrationNumber}
                        </TableCell>
                        <TableCell className="font-semibold text-xs text-slate-900 uppercase">
                          {report.patient.fullName}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-600 uppercase">
                          {report.patient.passportNumber}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 uppercase">
                          {report.patient.country}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {formatDate(report.registeredAt)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(report.status, report.finalMedicalStatus)}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {report.finalizedBy?.fullName || '—'}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Link href={`/reports/${report.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[11px] gap-1 hover:border-slate-400 rounded-lg"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View</span>
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Responsive Cards View */}
              <div className="md:hidden divide-y divide-slate-100 p-2 space-y-2">
                {data.recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {report.registrationNumber}
                      </span>
                      {getStatusBadge(report.status, report.finalMedicalStatus)}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-slate-900 uppercase">
                        {report.patient.fullName}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Passport: {report.patient.passportNumber} • {report.patient.country}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>Date: {formatDate(report.registeredAt)}</span>
                      <Link href={`/reports/${report.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5 rounded-lg"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span>Review</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
