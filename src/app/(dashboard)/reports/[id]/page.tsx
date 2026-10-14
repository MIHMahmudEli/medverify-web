'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDate, calculateAge } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ReportDetailSkeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/error-state';
import { ModalPortal } from '@/components/ui/modal-portal';
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
  FileDown,
  CheckCircle2,
  AlertTriangle,
  History,
  QrCode,
  Edit,
  Send,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Printer,
  FileText,
  Radiation,
  User,
  ShieldCheck,
  Building,
  RotateCcw,
} from 'lucide-react';

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, hasRole } = useAuth();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeStatus, setFinalizeStatus] = useState<'FIT' | 'UNFIT' | 'PENDING_INVESTIGATION'>('FIT');
  const [finalizeRemarks, setFinalizeRemarks] = useState('NORMAL');

  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendReason, setAmendReason] = useState('');
  const [amendFitness, setAmendFitness] = useState<'FIT' | 'UNFIT' | 'PENDING_INVESTIGATION'>('FIT');

  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [certificate, setCertificate] = useState<any>(null);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(`/reports/${id}`);
      setReport(res);
      setFinalizeStatus(res.finalMedicalStatus !== 'NOT_EVALUATED' ? res.finalMedicalStatus : 'FIT');
      setFinalizeRemarks(res.finalRemarks || 'NORMAL');

      try {
        const cert = await api.get<any>(`/reports/${id}/certificate`);
        setCertificate(cert);
      } catch {
        setCertificate(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const handleFinalize = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/reports/${id}/finalize`, {
        finalMedicalStatus: finalizeStatus,
        finalRemarks: finalizeRemarks,
      });
      setShowFinalizeModal(false);
      await loadReport();
    } catch (err: any) {
      setError(err.message || 'Failed to finalize report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAmend = async () => {
    if (!amendReason.trim()) {
      setError('Please provide a reason for amending this finalized report');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/reports/${id}/amend`, {
        reasonForChange: amendReason,
        finalMedicalStatus: amendFitness,
        reportData: report.reportData,
      });
      setShowAmendModal(false);
      setAmendReason('');
      await loadReport();
    } catch (err: any) {
      setError(err.message || 'Failed to amend report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) {
      setError('Please provide a reason for revoking this report');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/reports/${id}/revoke`, {
        revocationReason: revokeReason,
      });
      setShowRevokeModal(false);
      setRevokeReason('');
      await loadReport();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/reports/${id}/submit`);
      await loadReport();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueCertificate = async () => {
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/reports/${id}/certificate`, {});
      await loadReport();
    } catch (err: any) {
      setError(err.message || 'Failed to issue official certificate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await api.downloadBlob(`/reports/${id}/print-pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MedVerify_Certificate_and_Report_${report.registrationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert('Failed to download PDF: ' + (err.message || 'Error generating PDF'));
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return '/default_photo.png';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url;
    }
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
    return `${apiBase}/${url}`;
  };

  if (loading) {
    return <ReportDetailSkeleton />;
  }

  if (error || !report) {
    return (
      <ErrorState
        title="Examination Report Not Found"
        message={error || 'No examination record matches this identifier.'}
        onRetry={loadReport}
      />
    );
  }

  const p = report.patient;
  const d = report.reportData || {};
  const activeToken = report.verificationTokens?.find((t: any) => !t.isRevoked);

  const getStatusBadge = () => {
    if (report.status === 'FINALIZED') {
      if (report.finalMedicalStatus === 'FIT') return <Badge variant="fit">STATUS: FIT (FINALIZED)</Badge>;
      if (report.finalMedicalStatus === 'UNFIT') return <Badge variant="unfit">STATUS: UNFIT (FINALIZED)</Badge>;
      return <Badge variant="pending">STATUS: {report.finalMedicalStatus}</Badge>;
    }
    if (report.status === 'IN_REVIEW') return <Badge variant="pending">IN REVIEW (AWAITING SIGN-OFF)</Badge>;
    if (report.status === 'REVOKED') return <Badge variant="revoked">REVOKED</Badge>;
    return <Badge variant="draft">DRAFT (IN PROGRESS)</Badge>;
  };

  const canApprove = hasRole('SUPER_ADMIN', 'ADMIN', 'DOCTOR');
  const canRevoke = hasRole('SUPER_ADMIN', 'ADMIN');

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Back button + Details */}
          <div className="flex items-start sm:items-center gap-3.5">
            <Link href="/reports" aria-label="Back to reports">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs transition-all hover:bg-slate-50 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
                  Report {report.registrationNumber}
                </h1>
                {getStatusBadge()}
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Rev #{report.currentRevisionNumber}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                <span>Candidate: <strong className="text-slate-900 uppercase font-semibold">{p?.fullName || '—'}</strong></span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span>Passport: <strong className="text-slate-800 font-mono font-semibold">{p?.passportNumber || '—'}</strong></span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span>Exam Date: <strong className="text-slate-800 font-semibold">{formatDate(report.registeredAt)}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            {report.status === 'DRAFT' && (
              <>
                <Link href={`/reports/${report.id}/edit`}>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl border-slate-200 text-xs font-semibold">
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Draft</span>
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={actionLoading}
                  onClick={handleSubmitForReview}
                  className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit for Review</span>
                </Button>
              </>
            )}

            {canApprove && report.status !== 'FINALIZED' && report.status !== 'REVOKED' && (
              <Button
                variant="clinical"
                size="sm"
                disabled={actionLoading}
                onClick={() => setShowFinalizeModal(true)}
                className="h-9 gap-1.5 rounded-xl font-semibold shadow-2xs text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Finalize & Sign Off</span>
              </Button>
            )}

            {canApprove && report.status === 'FINALIZED' && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => setShowAmendModal(true)}
                className="h-9 gap-1.5 rounded-xl border-amber-300 text-amber-800 bg-amber-50/70 hover:bg-amber-100 font-semibold shadow-2xs text-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>Amend Report</span>
              </Button>
            )}

            {canRevoke && report.status === 'FINALIZED' && (
              <Button
                variant="destructive"
                size="sm"
                disabled={actionLoading}
                onClick={() => setShowRevokeModal(true)}
                className="h-9 gap-1.5 rounded-xl font-semibold shadow-2xs text-xs"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Revoke</span>
              </Button>
            )}

            {canApprove && report.status === 'FINALIZED' && !certificate && (
              <Button
                variant="default"
                size="sm"
                disabled={actionLoading}
                onClick={handleIssueCertificate}
                className="h-9 gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-2xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Issue Certificate</span>
              </Button>
            )}

            <Link href={`/reports/${report.id}/preview`}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold shadow-2xs text-xs"
              >
                <Printer className="h-3.5 w-3.5 text-teal-600" />
                <span>Preview & Print</span>
              </Button>
            </Link>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              className="h-9 gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xs font-semibold text-xs"
            >
              <FileDown className="h-3.5 w-3.5 text-teal-400" />
              <span>Download 2-Page PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Official Certificate Banner */}
      {certificate && (
        <Card className="bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 text-white border border-teal-800/40 shadow-float rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0 text-teal-300 shadow-inner">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-wide font-mono text-teal-200">
                    {certificate.certificateNumber}
                  </span>
                  <Badge variant="fit" className="text-[10px]">
                    OFFICIAL CERTIFICATE {certificate.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-300">
                  Issued: {formatDate(certificate.issuedAt)} • Two-Page Print System Active
                  {certificate.expiresAt && ` • Valid until: ${formatDate(certificate.expiresAt)}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/verify/${certificate.verificationToken}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-white border-slate-700 bg-slate-800/80 hover:bg-slate-700 gap-1.5 rounded-lg"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Verify Portal</span>
                </Button>
              </Link>

              <Link href={`/reports/${report.id}/preview`}>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold gap-1.5 rounded-lg shadow-2xs"
                >
                  <Printer className="h-3 w-3" />
                  <span>Print 2-Page PDF</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Identification Banner */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-xs">
          <div className="w-20 h-24 rounded-xl border border-slate-300 bg-slate-50 overflow-hidden flex-shrink-0 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getFullImageUrl(p?.photoUrl)}
              alt={p?.fullName || 'Candidate Photo'}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.fallbackTried && p?.photoUrl) {
                  target.dataset.fallbackTried = 'true';
                  const clean = p.photoUrl.replace(/^\//, '').split('/').pop();
                  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'https://medverify-api-y6am.onrender.com').replace(/\/+$/, '');
                  target.src = `${apiBase}/api/v1/uploads/file/${clean}`;
                } else {
                  target.src = '/default_photo.png';
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-3 gap-x-4 flex-1 text-xs text-center sm:text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Candidate Name
              </span>
              <span className="font-bold text-slate-900 uppercase block mt-0.5">
                {p?.fullName}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Passport No
              </span>
              <span className="font-mono font-bold text-slate-800 uppercase block mt-0.5">
                {p?.passportNumber}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Destination
              </span>
              <span className="font-bold text-slate-800 uppercase block mt-0.5">
                {p?.country}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Age / Gender
              </span>
              <span className="font-medium text-slate-800 block mt-0.5">
                {calculateAge(p?.dateOfBirth)} • {p?.gender}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Agency
              </span>
              <span className="font-medium text-slate-800 block mt-0.5 truncate">
                {p?.agency || 'DIRECT'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Height / Weight
              </span>
              <span className="font-medium text-slate-800 block mt-0.5">
                {p?.heightCm || '175'} cm / {p?.weightKg || '68'} kg
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Column Clinical Examination & Laboratory Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Medical Examination Table */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardHeader className="py-3 px-4 sm:px-6 bg-slate-900 text-white flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">
              Medical Examination
            </CardTitle>
            <span className="text-[10px] text-teal-300 font-mono">Clinical Check</span>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-slate-200">
                  <TableHead className="text-xs font-semibold text-slate-700 pl-4">Type of Exam</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-700 pr-4">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-slate-100">
                  <TableCell className="font-medium text-xs pl-4">EYE Visual Acuity</TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs pr-4">
                    R: {d.eye_visual_acuity_r || '6/6'} | L: {d.eye_visual_acuity_l || '6/6'}
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="font-medium text-xs pl-4">EAR</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs pr-4">
                    R: {d.ear_r || 'NAD'} | L: {d.ear_l || 'NAD'}
                  </TableCell>
                </TableRow>

                <TableRow className="bg-slate-50/60 border-slate-100">
                  <TableCell colSpan={2} className="py-1 pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Systemic Exam: Cardio-Vascular
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Blood Pressure (B.P)</TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs pr-4">{d.blood_pressure || '120/80'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Heart</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.heart || 'NAD'}</TableCell>
                </TableRow>

                <TableRow className="bg-slate-50/60 border-slate-100">
                  <TableCell colSpan={2} className="py-1 pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Respiratory & Gastrointestinal
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Lungs</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.lungs || 'NAD'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Abdomen</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.abdomen || 'NAD'}</TableCell>
                </TableRow>

                <TableRow className="bg-slate-50/60 border-slate-100">
                  <TableCell colSpan={2} className="py-1 pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Others & Physical Findings
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Hernia</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.hernia || 'ABSENT'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Varicose Veins</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.varicose_veins || 'ABSENT'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Deformities</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.deformities || 'ABSENT'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Skin</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.skin || 'NAD'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">C.N.S</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.cns || 'NAD'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Extremities</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.extremities || 'NAD'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Psychiatry</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.psychiatry || 'NAD'}</TableCell>
                </TableRow>

                <TableRow className="bg-slate-50/60 border-slate-100">
                  <TableCell colSpan={2} className="py-1 pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Venereal Disease & Remarks
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Symptoms</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.venereal_symptoms || 'NAD'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Exam Remarks</TableCell>
                  <TableCell className="text-right font-bold text-xs pr-4 text-emerald-700">{d.exam_remarks || 'NORMAL'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right: Laboratory Investigations Table */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardHeader className="py-3 px-4 sm:px-6 bg-slate-900 text-white flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">
              Laboratory Investigation
            </CardTitle>
            <span className="text-[10px] text-teal-300 font-mono">Biochemistry & Serology</span>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 border-slate-200">
                  <TableHead className="text-xs font-semibold text-slate-700 pl-4">Type of Exam</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-700 pr-4">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Urine for Sugar - Albumin</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.urine_sugar_albumin || 'NIL - NIL'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Urine Opiates - Cannabis</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.urine_opiates_cannabis || 'N/A - N/A - N/A'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Urine Pregnancy Test</TableCell>
                  <TableCell className="text-right font-semibold text-xs pr-4">{d.urine_pregnancy || 'N/A'}</TableCell>
                </TableRow>

                <TableRow className="bg-slate-50/60 border-slate-100">
                  <TableCell colSpan={2} className="py-1 pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Hematology & Biochemistry
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="font-bold text-xs pl-4">Blood Group</TableCell>
                  <TableCell className="text-right font-bold text-xs pr-4 text-slate-900">{d.blood_group || 'B (+VE)'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Haemoglobin</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs pr-4">{d.haemoglobin || '14.2'} g/dL</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">E.S.R</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs pr-4">{d.esr || '12'} mm/hr</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">R.B.S</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs pr-4">{d.rbs || '5.8'} mmol/L</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">S. Creatinine</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs pr-4">{d.s_creatinine || '1.0'} mg/dL</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">S. Bilirubin</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs pr-4">{d.s_bil || '0.85'} mg/dL</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">SGPT</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs pr-4">{d.sgpt || '35'} U/L</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">SGOT</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs pr-4">{d.sgot || '28'} U/L</TableCell>
                </TableRow>

                <TableRow className="bg-slate-50/60 border-slate-100">
                  <TableCell colSpan={2} className="py-1 pl-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Infectious Disease Serology
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="font-bold text-xs pl-4">HIV I & HIV II</TableCell>
                  <TableCell className="text-right font-bold text-xs pr-4 text-emerald-700">{d.hiv || 'NEGATIVE'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="font-bold text-xs pl-4">HBsAg</TableCell>
                  <TableCell className="text-right font-bold text-xs pr-4 text-emerald-700">{d.hbsag || 'NEGATIVE'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="font-bold text-xs pl-4">Anti HCV</TableCell>
                  <TableCell className="text-right font-bold text-xs pr-4 text-emerald-700">{d.anti_hcv || 'NEGATIVE'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="font-bold text-xs pl-4">VDRL</TableCell>
                  <TableCell className="text-right font-bold text-xs pr-4 text-emerald-700">{d.vdrl || 'NON REACTIVE'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="font-bold text-xs pl-4">TPHA</TableCell>
                  <TableCell className="text-right font-bold text-xs pr-4">{d.tpha || 'NEGATIVE'}</TableCell>
                </TableRow>

                <TableRow className="border-slate-100">
                  <TableCell className="text-xs pl-4">Lab Remarks</TableCell>
                  <TableCell className="text-right font-bold text-xs pr-4 text-red-600">{d.lab_remarks || 'NORMAL'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 3. Final Medical Status, Chest X-Ray & Cryptographic Verification Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status & Remarks */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Clinical Assessment & Medical Decision
            </span>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">HIS/HER STATUS:</span>
              <span className="border-2 border-red-600 px-3 py-1 text-xs font-bold text-slate-900 tracking-wider uppercase rounded">
                {report.finalMedicalStatus || 'FIT'}
              </span>
            </div>

            <div className="text-xs">
              <span className="font-semibold text-slate-700">REMARKS: </span>
              <span className="font-bold text-red-600">
                {report.finalRemarks || 'NORMAL'}
              </span>
            </div>

            {report.finalizedBy && (
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Finalized by: </span>
                <span className="font-semibold text-slate-800">{report.finalizedBy.fullName}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Signed on {formatDate(report.finalizedAt)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Chest X-Ray Preview */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">
            Chest Radiograph Finding
          </span>

          <div className="w-28 h-32 rounded-xl border border-slate-300 bg-slate-950 flex items-center justify-center overflow-hidden mb-2 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getFullImageUrl(report.xrayImageUrl || '/default_xray.png')}
              alt="Chest X-Ray"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-slate-800 block">
              Result: {report.xrayFinding || 'NORMAL'}
            </span>
            <span className="font-bold text-red-600 text-[11px] block">
              Remarks: {report.xrayRemarks || 'NORMAL'}
            </span>
          </div>
        </Card>

        {/* Cryptographic Verification Box */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">
            Cryptographic QR Authentication
          </span>

          {activeToken ? (
            <>
              <div className="w-24 h-24 bg-white border border-slate-200 p-1 flex items-center justify-center rounded-xl shadow-2xs mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://medverify-zeta.vercel.app/verify/${activeToken.token}`)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-900 block font-mono text-[10px] truncate max-w-[180px]">
                  {activeToken.token.substring(0, 16)}...
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Scans authenticated: {activeToken.scanCount} times
                </span>
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-2">
              <QrCode className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-[11px] text-slate-500 max-w-[180px]">
                QR token generated upon doctor finalization and issuance.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* FINALIZE & SIGN OFF MODAL */}
      {showFinalizeModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="max-w-md w-full bg-white shadow-2xl rounded-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
              <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                  <span>Doctor Finalization & Sign-Off</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  You are formally evaluating candidate fitness and issuing cryptographic authentication.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Final Medical Fitness Decision *
                  </label>
                  <select
                    value={finalizeStatus}
                    onChange={(e: any) => setFinalizeStatus(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                  >
                    <option value="FIT">FIT (Medically Approved)</option>
                    <option value="UNFIT">UNFIT (Failed Criteria)</option>
                    <option value="PENDING_INVESTIGATION">PENDING INVESTIGATION</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Physician Final Remarks
                  </label>
                  <Input
                    value={finalizeRemarks}
                    onChange={(e) => setFinalizeRemarks(e.target.value)}
                    placeholder="e.g. NORMAL"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-3.5 px-5 bg-slate-50/60 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFinalizeModal(false)}
                  className="h-9 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="clinical"
                  size="sm"
                  disabled={actionLoading}
                  onClick={handleFinalize}
                  className="h-9 text-xs rounded-xl font-semibold shadow-2xs"
                >
                  {actionLoading ? 'Approving...' : 'Confirm Approval & Generate QR'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </ModalPortal>
      )}

      {/* AMEND REPORT MODAL */}
      {showAmendModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="max-w-md w-full bg-white shadow-2xl rounded-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
              <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span>Amend Medical Report</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Amending will increment revision to #{report.currentRevisionNumber + 1}, supersede old QR tokens, and record an immutable revision history.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Reason for Amendment *
                  </label>
                  <Input
                    required
                    value={amendReason}
                    onChange={(e) => setAmendReason(e.target.value)}
                    placeholder="e.g. Corrected Blood Group, repeated lab panel"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Updated Medical Fitness Decision *
                  </label>
                  <select
                    value={amendFitness}
                    onChange={(e: any) => setAmendFitness(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                  >
                    <option value="FIT">FIT</option>
                    <option value="UNFIT">UNFIT</option>
                    <option value="PENDING_INVESTIGATION">PENDING INVESTIGATION</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-3.5 px-5 bg-slate-50/60 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAmendModal(false)}
                  className="h-9 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  disabled={actionLoading}
                  onClick={handleAmend}
                  className="h-9 text-xs rounded-xl font-semibold shadow-2xs"
                >
                  {actionLoading ? 'Amending...' : 'Submit Amendment'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </ModalPortal>
      )}

      {/* REVOKE REPORT MODAL */}
      {showRevokeModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="max-w-md w-full bg-white shadow-2xl rounded-2xl border border-rose-200 animate-in zoom-in-95 duration-200 overflow-hidden">
              <CardHeader className="bg-rose-50/70 border-b border-rose-100 pb-3">
                <CardTitle className="text-base font-bold text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <span>Revoke Medical Report</span>
                </CardTitle>
                <CardDescription className="text-xs text-rose-600/90">
                  Revoking will permanently invalidate this medical file and mark public verification lookups as REVOKED.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Official Revocation Reason *
                  </label>
                  <Input
                    required
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="e.g. Identity fraud, clinical discrepancy"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-3.5 px-5 bg-slate-50/60 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevokeModal(false)}
                  className="h-9 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={actionLoading}
                  onClick={handleRevoke}
                  className="h-9 text-xs rounded-xl font-semibold shadow-2xs"
                >
                  {actionLoading ? 'Revoking...' : 'Confirm Revocation'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
