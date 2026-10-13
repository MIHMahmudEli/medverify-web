'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MetricCardsSkeleton, TableSkeleton } from '@/components/ui/skeleton';
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

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.get<DashboardData>('/dashboard/metrics');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

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
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Clinical Operations Dashboard
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseSubtle" />
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time medical checkup volume, review queues, and verified certificates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/patients/new">
            <Button variant="outline" size="sm" className="gap-1.5 shadow-2xs">
              <Users className="h-3.5 w-3.5 text-slate-500" />
              <span>Register Patient</span>
            </Button>
          </Link>
          <Link href="/reports/new">
            <Button variant="default" size="sm" className="gap-1.5 shadow-2xs">
              <Plus className="h-3.5 w-3.5" />
              <span>New Medical Report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      {loading ? (
        <MetricCardsSkeleton count={5} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3.5 bg-white border-slate-200 shadow-xs interactive-card">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Patients</span>
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {data?.metrics.totalPatients ?? 0}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Total registered profiles</span>
          </Card>

          <Card className="p-3.5 bg-white border-slate-200 shadow-xs interactive-card">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Reports</span>
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                <FileText className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              {data?.metrics.totalReports ?? 0}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Clinical examinations</span>
          </Card>

          <Card className="p-3.5 bg-white border-slate-200 shadow-xs interactive-card">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Drafts</span>
              <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                <FileCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-700 mt-1">
              {data?.metrics.draftReports ?? 0}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Data entry pending</span>
          </Card>

          <Card className="p-3.5 bg-white border-amber-200 shadow-xs interactive-card">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">In Review</span>
              <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-amber-800 mt-1">
              {data?.metrics.reviewReports ?? 0}
            </div>
            <span className="text-[10px] text-amber-700 font-medium">Awaiting doctor sign-off</span>
          </Card>

          <Card className="p-3.5 bg-white border-emerald-200 shadow-xs interactive-card">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Finalized</span>
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-800 mt-1">
              {data?.metrics.finalizedReports ?? 0}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Approved with QR token</span>
          </Card>
        </div>
      )}

      {/* Recent Reports Table */}
      <Card className="bg-white border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3.5 px-4 bg-slate-50/50 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">Recent Examination Reports</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Live medical reports recorded across diagnostic departments.
            </CardDescription>
          </div>
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-600 hover:text-slate-900">
              <span>View All Reports</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={8} />
          ) : !data?.recentReports || data.recentReports.length === 0 ? (
            <div className="p-12 text-center space-y-2.5">
              <FileText className="h-9 w-9 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No medical reports recorded yet.</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Begin by creating a new patient record or starting a medical test report.
              </p>
              <Link href="/reports/new">
                <Button size="sm" className="mt-2 text-xs">
                  Create First Report
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="text-xs font-semibold text-slate-600">Reg Number</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Patient Name</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Passport</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Country</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Reviewer</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentReports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-slate-900">
                      {report.registrationNumber}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-slate-900">
                      {report.patient.fullName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {report.patient.passportNumber}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
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
                    <TableCell className="text-right">
                      <Link href={`/reports/${report.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-[11px] gap-1 hover:border-slate-400"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
