'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Users,
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Eye,
  FileCheck,
  ArrowRight,
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
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Clinical Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time medical checkup volume, review queues, and issued reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/patients/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>Register Patient</span>
            </Button>
          </Link>
          <Link href="/reports/new">
            <Button variant="default" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>New Medical Report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Patients</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {loading ? '—' : data?.metrics.totalPatients ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Total registered</span>
        </Card>

        <Card className="p-3 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Reports</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {loading ? '—' : data?.metrics.totalReports ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Total generated</span>
        </Card>

        <Card className="p-3 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Drafts</span>
            <FileCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-700">
            {loading ? '—' : data?.metrics.draftReports ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Data entry pending</span>
        </Card>

        <Card className="p-3 bg-white border-amber-200">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">In Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-800">
            {loading ? '—' : data?.metrics.reviewReports ?? 0}
          </div>
          <span className="text-[10px] text-amber-600/80">Awaiting doctor sign-off</span>
        </Card>

        <Card className="p-3 bg-white border-teal-200">
          <div className="flex items-center justify-between text-teal-700 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Finalized</span>
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-teal-800">
            {loading ? '—' : data?.metrics.finalizedReports ?? 0}
          </div>
          <span className="text-[10px] text-teal-600/80">Approved with QR</span>
        </Card>
      </div>

      {/* Recent Reports Table */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div>
            <CardTitle>Recent Examination Reports</CardTitle>
            <CardDescription>Live medical reports recorded across all departments.</CardDescription>
          </div>
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <span>View All Reports</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading live records...</div>
          ) : !data?.recentReports || data.recentReports.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FileText className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No medical reports created yet.</p>
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
                <TableRow>
                  <TableHead>Reg Number</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Passport</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono font-medium text-slate-900">
                      {report.registrationNumber}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {report.patient.fullName}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600">
                      {report.patient.passportNumber}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {report.patient.country}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(report.registeredAt)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(report.status, report.finalMedicalStatus)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {report.finalizedBy?.fullName || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/reports/${report.id}`}>
                        <Button variant="outline" size="sm" className="h-6.5 px-2 text-[11px] gap-1">
                          <Eye className="h-3 w-3" />
                          <span>Open</span>
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
