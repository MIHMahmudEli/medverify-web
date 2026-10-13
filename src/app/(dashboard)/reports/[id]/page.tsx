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
      setError(err.message || 'Failed to load report');
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
      alert('Failed to download PDF: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-2">
        <ReportDetailSkeleton />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-12 text-center space-y-3 animate-fadeIn">
        <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-xs font-semibold text-rose-700">{error || 'Report not found.'}</p>
        <Link href="/reports">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Reports
          </Button>
        </Link>
      </div>
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
    if (report.status === 'IN_REVIEW') return <Badge variant="pending">IN REVIEW (AWAITING DOCTOR)</Badge>;
    if (report.status === 'REVOKED') return <Badge variant="revoked">REVOKED</Badge>;
    return <Badge variant="draft">DRAFT (IN PROGRESS)</Badge>;
  };

  const canApprove = hasRole('SUPER_ADMIN', 'ADMIN', 'DOCTOR');
  const canRevoke = hasRole('SUPER_ADMIN', 'ADMIN');

  return (
    <div className="space-y-4 max-w-6xl mx-auto animate-fadeIn">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/reports">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-mono">
                {report.registrationNumber}
              </h1>
              {getStatusBadge()}
              <span className="text-[11px] font-mono text-slate-500">
                Rev #{report.currentRevisionNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Patient: <span className="font-semibold text-slate-800">{p?.fullName}</span> • Exam Date: {formatDate(report.registeredAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {report.status === 'DRAFT' && (
            <>
              <Link href={`/reports/${report.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit Draft</span>
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                disabled={actionLoading}
                onClick={handleSubmitForReview}
                className="gap-1.5"
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
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Finalize & Approve</span>
            </Button>
          )}

          {canApprove && report.status === 'FINALIZED' && (
            <Button
              variant="outline"
              size="sm"
              disabled={actionLoading}
              onClick={() => setShowAmendModal(true)}
              className="gap-1.5"
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
              className="gap-1.5"
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
              className="gap-1.5 bg-teal-700 hover:bg-teal-800 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Issue Official Certificate</span>
            </Button>
          )}

          <Link href={`/reports/${report.id}/preview`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <span>Preview & Print (2-Page)</span>
            </Button>
          </Link>

          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadPdf}
            className="gap-1.5"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Download 2-Page PDF</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Official Certificate Banner */}
      {certificate && (
        <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white border-none shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0 text-teal-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-wide font-mono text-teal-200">
                    {certificate.certificateNumber}
                  </span>
                  <Badge variant="fit" className="text-[10px]">
                    OFFICIAL CERTIFICATE {certificate.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Issued: {formatDate(certificate.issuedAt)} • Two-Page Print System Ready
                  {certificate.expiresAt && ` • Valid until: ${formatDate(certificate.expiresAt)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/verify/${certificate.verificationToken}`} target="_blank">
                <Button variant="outline" size="sm" className="h-7.5 text-xs text-slate-200 border-slate-600 hover:bg-slate-800 gap-1.5">
                  <ExternalLink className="h-3 w-3" />
                  <span>Verify Portal</span>
                </Button>
              </Link>
              <Link href={`/reports/${report.id}/preview`}>
                <Button size="sm" className="h-7.5 text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1.5">
                  <Printer className="h-3 w-3" />
                  <span>Print 2-Page PDF</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Banner */}
      <Card className="bg-white">
        <CardContent className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
          {p?.photoUrl && (
            <div className="w-16 h-20 rounded border border-slate-300 bg-slate-50 overflow-hidden flex-shrink-0 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.photoUrl.startsWith('http') ? p.photoUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${p.photoUrl.startsWith('/') ? '' : '/'}${p.photoUrl}`}
                alt={p.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs flex-1">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Name</span>
              <span className="font-semibold text-slate-900">{p?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Passport</span>
              <span className="font-mono font-semibold text-slate-800">{p?.passportNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Country</span>
              <span className="text-slate-800">{p?.country}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age / Gender</span>
              <span className="text-slate-800">{calculateAge(p?.dateOfBirth)} • {p?.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Agency</span>
              <span className="text-slate-800">{p?.agency || 'DIRECT'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Height / Weight</span>
              <span className="text-slate-800">{p?.heightCm || '—'} cm / {p?.weightKg || '—'} kg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Medical Report Card Layout (Exact layout of reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Physical & Clinical Exam */}
        <Card className="bg-white">
          <CardHeader className="py-2.5 bg-slate-900 text-white rounded-t">
            <CardTitle className="text-xs uppercase tracking-wider text-white font-semibold">
              Medical Examination
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Type of Exam</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">EYE Visual Acuity</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    R: {d.eye_visual_acuity_r || '6/6'} | L: {d.eye_visual_acuity_l || '6/6'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EAR</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    R: {d.ear_r || 'NAD'} | L: {d.ear_l || 'NAD'}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50">
                  <TableCell colSpan={2} className="py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Systemic Exam: Cardio-Vascular
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Blood Pressure (B.P)</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{d.blood_pressure || '120/80'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Heart</TableCell>
                  <TableCell className="text-right font-semibold">{d.heart || 'NAD'}</TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50">
                  <TableCell colSpan={2} className="py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Respiratory & Gastrointestinal
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Lungs</TableCell>
                  <TableCell className="text-right font-semibold">{d.lungs || 'NAD'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Abdomen</TableCell>
                  <TableCell className="text-right font-semibold">{d.abdomen || 'NAD'}</TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50">
                  <TableCell colSpan={2} className="py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Others & Physical Findings
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Hernia</TableCell>
                  <TableCell className="text-right font-semibold">{d.hernia || 'ABSENT'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Varicose Veins</TableCell>
                  <TableCell className="text-right font-semibold">{d.varicose_veins || 'ABSENT'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Deformities</TableCell>
                  <TableCell className="text-right font-semibold">{d.deformities || 'ABSENT'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Skin / C.N.S</TableCell>
                  <TableCell className="text-right font-semibold">{d.skin || 'NAD'} / {d.cns || 'NAD'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Extremities / Psychiatry</TableCell>
                  <TableCell className="text-right font-semibold">{d.extremities || 'NAD'} / {d.psychiatry || 'NAD'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Venereal Disease Symptoms</TableCell>
                  <TableCell className="text-right font-semibold">{d.venereal_symptoms || 'NAD'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Clinical Remarks</TableCell>
                  <TableCell className="text-right font-semibold">{d.exam_remarks || 'NAD'}</TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50">
                  <TableCell colSpan={2} className="py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    X-Ray Investigation
                  </TableCell>
                </TableRow>
                {report.xrayImageUrl && (
                  <TableRow>
                    <TableCell colSpan={2} className="p-3 bg-slate-950/5">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-20 rounded border border-slate-300 bg-slate-950 overflow-hidden flex items-center justify-center shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={report.xrayImageUrl.startsWith('http') ? report.xrayImageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${report.xrayImageUrl.startsWith('/') ? '' : '/'}${report.xrayImageUrl}`}
                            alt="Chest Radiograph"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-xs space-y-0.5">
                          <span className="font-semibold text-slate-900 block">Chest Radiograph Attached</span>
                          <span className="text-[11px] text-slate-500 block">PA view chest radiograph embedded into official certificate</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell>Chest X-Ray</TableCell>
                  <TableCell className="text-right font-semibold">{report.xrayFinding || 'NORMAL'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>X-Ray Remarks</TableCell>
                  <TableCell className="text-right font-semibold text-rose-600">{report.xrayRemarks || 'NORMAL'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column: Laboratory Investigation */}
        <Card className="bg-white">
          <CardHeader className="py-2.5 bg-slate-900 text-white rounded-t">
            <CardTitle className="text-xs uppercase tracking-wider text-white font-semibold">
              Laboratory Investigation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Type of Exam</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Urine Sugar - Albumin</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{d.urine_sugar_albumin || 'NIL - NIL'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Urine Opiates - Cannabis</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{d.urine_opiates_cannabis || 'N/A - N/A - N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Urine Pregnancy Test</TableCell>
                  <TableCell className="text-right font-semibold">{d.urine_pregnancy || 'N/A'}</TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50">
                  <TableCell colSpan={2} className="py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Blood Panel & Biochemistry
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Blood Group</TableCell>
                  <TableCell className="text-right font-semibold font-mono">{d.blood_group || 'O (+VE)'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Haemoglobin (gm/dl)</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{d.haemoglobin || '14.2'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ESR (mm/1st hr)</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{d.esr || '12'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>R.B.S (mmol/L)</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{d.rbs || '5.8'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>S. Creatinine (mg/dl)</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{d.s_creatinine || '1.0'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>S. Bilirubin (mg/dl)</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{d.s_bil || '0.85'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>SGPT (ALT) / SGOT (AST)</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {d.sgpt || '35'} U/L / {d.sgot || '28'} U/L
                  </TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50">
                  <TableCell colSpan={2} className="py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Infectious Diseases Screening
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>HIV I & HIV II</TableCell>
                  <TableCell className="text-right font-semibold">{d.hiv || 'NEGATIVE'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>HBsAg (Hepatitis B)</TableCell>
                  <TableCell className="text-right font-semibold">{d.hbsag || 'NEGATIVE'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Anti HCV (Hepatitis C)</TableCell>
                  <TableCell className="text-right font-semibold">{d.anti_hcv || 'NEGATIVE'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>VDRL</TableCell>
                  <TableCell className="text-right font-semibold">{d.vdrl || 'NON REACTIVE'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>TPHA</TableCell>
                  <TableCell className="text-right font-semibold">{d.tpha || 'NEGATIVE'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Laboratory Remarks</TableCell>
                  <TableCell className="text-right font-semibold">{d.lab_remarks || 'NORMAL'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Online Verification QR & Final Decision Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Medical Status Summary */}
        <Card className="md:col-span-2 bg-white">
          <CardHeader className="py-2.5">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Final Medical Status & Decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Official Decision:</span>
              {getStatusBadge()}
            </div>
            <div className="text-xs text-slate-700">
              <span className="text-slate-400">Doctor Remarks: </span>
              <span className="font-semibold">{report.finalRemarks || 'NORMAL'}</span>
            </div>
            {report.finalizedBy && (
              <div className="text-[11px] text-slate-500 pt-1">
                Approved by <span className="font-medium text-slate-800">{report.finalizedBy.fullName}</span> on {formatDate(report.finalizedAt)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code and Online Verification */}
        <Card className="bg-white">
          <CardHeader className="py-2.5">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Public QR Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeToken ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Cryptographic Token Active</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] font-mono break-all text-slate-600">
                  Token: {activeToken.token.substring(0, 16)}...
                </div>
                <a
                  href={`/verify/${activeToken.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline font-medium"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Public Verification Page</span>
                </a>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Verification token is automatically issued upon doctor finalization.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revision History */}
      {report.revisions && report.revisions.length > 0 && (
        <Card className="bg-white">
          <CardHeader className="py-2.5">
            <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
              Revision Audit History
            </CardTitle>
            <CardDescription className="text-xs">
              Every amendment creates an immutable snapshot. Past revisions are permanently preserved.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Revision</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Reason for Change</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.revisions.map((rev: any) => (
                  <TableRow key={rev.id}>
                    <TableCell className="font-mono font-semibold">#{rev.revisionNumber}</TableCell>
                    <TableCell>
                      <Badge variant={rev.finalMedicalStatus === 'FIT' ? 'fit' : 'unfit'}>
                        {rev.finalMedicalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{rev.reasonForChange || 'Initial Approval'}</TableCell>
                    <TableCell className="text-slate-600">{rev.changedBy?.fullName || 'Doctor'}</TableCell>
                    <TableCell className="text-slate-500 text-xs">{formatDate(rev.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* FINALIZATION MODAL */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeInFast">
          <Card className="max-w-md w-full bg-white shadow-2xl rounded-xl border border-slate-200 animate-scaleIn overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
              <CardTitle className="text-base text-slate-900">Finalize & Approve Medical Report</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                As an authorized medical officer, select the final medical status and approve issuance of the verified certificate with QR code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Final Medical Fitness Status *
                </label>
                <select
                  value={finalizeStatus}
                  onChange={(e: any) => setFinalizeStatus(e.target.value)}
                  className="flex h-8.5 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
                >
                  <option value="FIT">FIT (Eligible for Travel / Work)</option>
                  <option value="UNFIT">UNFIT (Ineligible)</option>
                  <option value="PENDING_INVESTIGATION">PENDING INVESTIGATION</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Remarks *
                </label>
                <Input
                  value={finalizeRemarks}
                  onChange={(e) => setFinalizeRemarks(e.target.value)}
                  placeholder="e.g. NORMAL"
                  className="h-8.5 text-xs"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between py-3 bg-slate-50/50 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowFinalizeModal(false)}>
                Cancel
              </Button>
              <Button
                variant="clinical"
                size="sm"
                disabled={actionLoading}
                onClick={handleFinalize}
                className="shadow-subtle"
              >
                {actionLoading ? 'Approving...' : 'Confirm Approval & Generate QR'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* AMEND MODAL */}
      {showAmendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeInFast">
          <Card className="max-w-md w-full bg-white shadow-2xl rounded-xl border border-slate-200 animate-scaleIn overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
              <CardTitle className="text-base text-slate-900">Amend Medical Report</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Amending will increment revision number to #{report.currentRevisionNumber + 1}, revoke the old QR token, and record an immutable revision history.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Reason for Amendment *
                </label>
                <Input
                  required
                  value={amendReason}
                  onChange={(e) => setAmendReason(e.target.value)}
                  placeholder="e.g. Corrected Blood Group, repeat lab examination"
                  className="h-8.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Updated Status *
                </label>
                <select
                  value={amendFitness}
                  onChange={(e: any) => setAmendFitness(e.target.value)}
                  className="flex h-8.5 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
                >
                  <option value="FIT">FIT</option>
                  <option value="UNFIT">UNFIT</option>
                  <option value="PENDING_INVESTIGATION">PENDING INVESTIGATION</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between py-3 bg-slate-50/50 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowAmendModal(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={actionLoading}
                onClick={handleAmend}
                className="shadow-subtle"
              >
                {actionLoading ? 'Amending...' : 'Submit Amendment'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* REVOKE MODAL */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeInFast">
          <Card className="max-w-md w-full bg-white shadow-2xl rounded-xl border border-rose-200 animate-scaleIn overflow-hidden">
            <CardHeader className="bg-rose-50/70 border-b border-rose-100 pb-3">
              <CardTitle className="text-base text-rose-800 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                <span>Revoke Medical Report</span>
              </CardTitle>
              <CardDescription className="text-xs text-rose-600/80">
                Revoking will permanently deactivate this report and mark any online QR verification check as REVOKED.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Official Revocation Reason *
                </label>
                <Input
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Identity discrepancy, investigation fraud"
                  className="h-8.5 text-xs"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between py-3 bg-slate-50/50 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowRevokeModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={actionLoading}
                onClick={handleRevoke}
                className="shadow-subtle"
              >
                {actionLoading ? 'Revoking...' : 'Confirm Revocation'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
