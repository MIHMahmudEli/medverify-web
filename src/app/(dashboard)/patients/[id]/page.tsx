'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatDate, calculateAge } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PatientProfileSkeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Edit,
  Plus,
  FileText,
  Eye,
  User,
  MapPin,
  Calendar,
  Building,
  FilePlus,
  ShieldCheck,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatient = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(`/patients/${id}`);
      setPatient(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidate record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadPatient();
    }
  }, [id]);

  if (loading) {
    return <PatientProfileSkeleton />;
  }

  if (error || !patient) {
    return (
      <ErrorState
        title="Candidate Profile Not Found"
        message={error || 'No patient record matches this identifier.'}
        onRetry={loadPatient}
      />
    );
  }

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

  const getPhotoUrl = (url?: string) => {
    if (!url) return '/default_photo.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url;
    }
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
    return `${apiBase}/${url}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title={patient.fullName}
        description={`Overseas employment profile registered on ${formatDate(patient.createdAt)}`}
        backHref="/patients"
        backLabel="Back to Patient Directory"
        badge={
          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 uppercase">
            {patient.passportNumber}
          </span>
        }
        actions={
          <>
            <Link href={`/patients/${patient.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-lg border-slate-200 text-slate-700 hover:border-slate-300"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Details</span>
              </Button>
            </Link>

            <Link href={`/reports/new?patientId=${patient.id}`}>
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

      {/* Candidate Profile Details Card */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
        <CardHeader className="py-3.5 px-4 sm:px-6 bg-slate-50/60 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Biometric & Clinical Identity
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Verified candidate records for visa medical examination.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Photograph Container */}
            <div className="w-28 sm:w-32 h-36 sm:h-40 rounded-xl border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden relative shadow-2xs flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPhotoUrl(patient.photoUrl)}
                alt={patient.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default_photo.png';
                }}
              />
            </div>

            {/* Demographic Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 flex-1 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Full Name
                </span>
                <span className="font-bold text-slate-900 uppercase block mt-0.5">
                  {patient.fullName}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Passport Number
                </span>
                <span className="font-mono font-bold text-slate-900 uppercase block mt-0.5">
                  {patient.passportNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Date of Birth / Age
                </span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)})
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Gender
                </span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {patient.gender}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Nationality
                </span>
                <span className="font-medium text-slate-800 uppercase block mt-0.5">
                  {patient.nationality || 'Bangladeshi'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Destination Country
                </span>
                <span className="font-bold text-slate-900 uppercase block mt-0.5">
                  {patient.country}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Marital Status
                </span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {patient.maritalStatus || 'Married'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Religion
                </span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {patient.religion || 'Islam'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Height / Weight
                </span>
                <span className="font-medium text-slate-800 block mt-0.5">
                  {patient.heightCm ? `${patient.heightCm} cm` : '—'} /{' '}
                  {patient.weightKg ? `${patient.weightKg} kg` : '—'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Recruiting Agency
                </span>
                <span className="font-medium text-slate-800 block mt-0.5 truncate">
                  {patient.agency || '—'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Contact Phone
                </span>
                <span className="font-mono text-slate-800 block mt-0.5">
                  {patient.phone || '—'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Registration Date
                </span>
                <span className="text-slate-600 block mt-0.5">
                  {formatDate(patient.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Associated Medical Reports */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-4 sm:px-6 bg-slate-50/60 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Clinical Reports & Certificate Records
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Medical examination files recorded for this candidate.
            </CardDescription>
          </div>

          <Link href={`/reports/new?patientId=${patient.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs rounded-lg border-slate-200"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Examination</span>
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {!patient.reports || patient.reports.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FileText}
                title="No examination reports recorded"
                description="This candidate does not have an active medical examination report yet."
                action={
                  <Link href={`/reports/new?patientId=${patient.id}`}>
                    <Button size="sm" className="gap-1.5 rounded-lg text-xs">
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create Examination Report</span>
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 border-slate-200 hover:bg-slate-50/70">
                    <TableHead className="text-xs font-semibold text-slate-700 pl-6">
                      Registration No
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Exam Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Medical Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Workflow Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Remarks
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-700 pr-6">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.reports.map((report: any) => (
                    <TableRow
                      key={report.id}
                      className="hover:bg-slate-50/80 border-slate-100 transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-bold text-slate-900 pl-6">
                        {report.registrationNumber}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {formatDate(report.registeredAt || report.createdAt)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status, report.finalMedicalStatus)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-600">
                        {report.status}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {report.finalRemarks || 'NORMAL'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Link href={`/reports/${report.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-[11px] gap-1 rounded-lg"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Report</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
