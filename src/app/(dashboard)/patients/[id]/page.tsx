'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatDate, calculateAge } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      try {
        const res = await api.get<any>(`/patients/${id}`);
        setPatient(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPatient();
    }
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center text-xs text-slate-400">Loading patient profile...</div>;
  }

  if (!patient) {
    return <div className="p-10 text-center text-xs text-rose-500">Patient record not found.</div>;
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

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/patients">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {patient.fullName}
            </h1>
            <span className="font-mono text-xs text-slate-500">
              Passport: {patient.passportNumber} • {patient.country}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/patients/${patient.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Demographic Info</span>
            </Button>
          </Link>
          <Link href={`/reports/new?patientId=${patient.id}`}>
            <Button variant="default" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Generate Medical Report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Demographics Summary Card */}
      <Card className="bg-white">
        <CardHeader className="py-3">
          <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Patient Information Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Full Name</span>
            <span className="font-semibold text-slate-900">{patient.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Passport Number</span>
            <span className="font-mono font-semibold text-slate-900">{patient.passportNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Date of Birth / Age</span>
            <span className="text-slate-800">
              {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Gender</span>
            <span className="text-slate-800">{patient.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Nationality</span>
            <span className="text-slate-800">{patient.nationality}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Destination Country</span>
            <span className="text-slate-800">{patient.country}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Marital Status / Religion</span>
            <span className="text-slate-800">
              {patient.maritalStatus || 'Single'} • {patient.religion || 'Islam'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Recruiting Agency</span>
            <span className="text-slate-800">{patient.agency || '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Height & Weight</span>
            <span className="text-slate-800">
              {patient.heightCm ? `${patient.heightCm} cm` : '—'} /{' '}
              {patient.weightKg ? `${patient.weightKg} kg` : '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Phone / Email</span>
            <span className="text-slate-800">
              {patient.phone || '—'} • {patient.email || '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reports History */}
      <Card className="bg-white">
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Medical Examination History</CardTitle>
            <CardDescription>
              All medical tests, laboratory investigations, and fitness certifications issued for this patient.
            </CardDescription>
          </div>
          <Link href={`/reports/new?patientId=${patient.id}`}>
            <Button size="sm" className="gap-1 text-xs">
              <Plus className="h-3 w-3" />
              <span>New Report</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {!patient.reports || patient.reports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No examination reports generated for this patient yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revision</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.reports.map((rep: any) => (
                  <TableRow key={rep.id}>
                    <TableCell className="font-mono font-medium text-slate-900">
                      {rep.registrationNumber}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(rep.registeredAt)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(rep.status, rep.finalMedicalStatus)}
                    </TableCell>
                    <TableCell className="font-mono text-slate-500 text-[11px]">
                      Rev #{rep.currentRevisionNumber}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/reports/${rep.id}`}>
                        <Button variant="outline" size="sm" className="h-6.5 px-2 text-[11px] gap-1">
                          <Eye className="h-3 w-3" />
                          <span>View Report</span>
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
