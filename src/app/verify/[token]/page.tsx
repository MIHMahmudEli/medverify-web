'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CertificateSkeleton } from '@/components/ui/skeleton';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Printer,
  Stethoscope,
  Building2,
  Calendar,
  Lock,
  Globe2,
  Shield,
  Clock,
  Download,
  UserCheck,
  Activity,
  FileCheck2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const defaultApi =
  process.env.NODE_ENV === 'production'
    ? 'https://medverify-api-y6am.onrender.com'
    : 'http://localhost:4000';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || defaultApi).replace(/\/+$/, '');

interface PublicVerificationData {
  verified: boolean;
  status: 'VALID' | 'REVOKED' | 'SUPERSEDED' | 'EXPIRED' | 'INVALID' | 'DRAFT';
  message?: string;
  token?: string;
  certificate?: {
    id?: string;
    certificateNumber: string;
    issueDate: string;
    expiresAt?: string;
    status: string;
    issuingOrganization: string;
    finalMedicalStatus: string;
    authorizedSignatory?: {
      name: string;
      designation: string;
      licenseNumber?: string;
    };
  };
  patient?: {
    fullName?: string;
    patientInitials?: string;
    passportNumber?: string;
    dateOfBirth?: string;
    nationality?: string;
    destinationCountry?: string;
    agency?: string;
  };
  associatedReport?: {
    registrationNumber: string;
    examinationDate: string;
    reportStatus: string;
    finalMedicalStatus: string;
    revisionNumber: number;
    categoriesPerformed: string[];
    isDetailedPublic: boolean;
    detailedSections?: {
      physicalExam?: Record<string, any>;
      systemicExam?: Record<string, any>;
      laboratory?: Record<string, any>;
      xrayFinding?: string;
      xrayRemarks?: string;
    };
    restrictionNotice?: string;
  };
  registrationNumber?: string;
  registeredAt?: string;
  finalMedicalStatus?: string;
  finalizedAt?: string;
  issuingOrganization?: string;
  patientInitials?: string;
  destinationCountry?: string;
  agency?: string;
  revocationReason?: string;
  revokedAt?: string;
  allowPublicDownload?: boolean;
  allowPublicPrint?: boolean;
}

export default function PublicVerificationPage() {
  const { token } = useParams();
  const [data, setData] = useState<PublicVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  useEffect(() => {
    async function checkVerification() {
      try {
        let res: Response;
        try {
          res = await fetch(`${API_BASE}/api/v1/public/verify/${token}`);
          if (!res.ok && res.status >= 500) throw new Error('Direct fetch failed');
        } catch {
          res = await fetch(`/api/v1/public/verify/${token}`);
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setData({
          verified: false,
          status: 'INVALID',
          message: 'Unable to communicate with verification servers. Please check your internet connection.',
        });
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      checkVerification();
    }
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!data?.certificate?.id && !data?.registrationNumber) return;
    const target = data?.certificate?.id
      ? `${API_BASE}/api/v1/certificates/${data.certificate.id}/print-pdf`
      : `${API_BASE}/api/v1/reports/${data.registrationNumber}/print-pdf`;
    window.open(target, '_blank');
  };

  const cert = data?.certificate;
  const pat = data?.patient;
  const rep = data?.associatedReport;
  const regNumber = cert?.certificateNumber ? data?.registrationNumber : data?.registrationNumber;
  const certNumber = cert?.certificateNumber || (data?.status === 'VALID' ? `MC-${data.registrationNumber}` : '—');
  const fitness = cert?.finalMedicalStatus || data?.finalMedicalStatus || 'FIT';
  const isFit = fitness === 'FIT';

  return (
    <div className="min-h-screen bg-slate-100/90 py-10 px-4 flex flex-col items-center justify-center print:bg-white print:p-0">
      <div className="w-full max-w-2xl space-y-4 animate-fadeIn">
        {/* Header branding */}
        <div className="flex flex-col items-center text-center space-y-1.5 print:hidden">
          <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-card">
            <Stethoscope className="h-6 w-6 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
            {cert?.issuingOrganization || data?.issuingOrganization || 'MedVerify Digital Verification'}
          </h1>
          <p className="text-xs text-slate-500 max-w-md">
            Official Pre-Employment Medical Examination & Certificate Authentication Portal
          </p>
        </div>

        {/* Verification Card */}
        <Card className="bg-white border-slate-200/90 shadow-card print:border-none print:shadow-none rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6">
              <CertificateSkeleton />
            </div>
          ) : (
            <>
              {/* STATUS BANNER */}
              {data?.status === 'VALID' ? (
                <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="relative flex-shrink-0">
                    <div className="h-11 w-11 rounded-full bg-emerald-500/30 flex items-center justify-center ring-2 ring-emerald-400/50">
                      <ShieldCheck className="h-6 w-6 text-emerald-300" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-emerald-900 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold tracking-wider uppercase">
                        Officially Verified & Authentic Certificate
                      </h2>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 px-2 py-0.2 rounded-full font-mono">
                        AUTHENTICATED
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-100/90 mt-0.5 leading-relaxed">
                      This medical fitness certificate has been authenticated against the MedVerify central clinical registry.
                    </p>
                  </div>
                </div>
              ) : data?.status === 'DRAFT' ? (
                <div className="p-5 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="h-11 w-11 rounded-full bg-amber-500/30 flex items-center justify-center ring-2 ring-amber-400/50 flex-shrink-0">
                    <FileText className="h-6 w-6 text-amber-200" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase">
                      Examination In Progress (Draft Report)
                    </h2>
                    <p className="text-[11px] text-amber-100/90 mt-0.5">
                      Registered in MedVerify system. Currently awaiting doctor review and final clinical authorization.
                    </p>
                  </div>
                </div>
              ) : data?.status === 'REVOKED' ? (
                <div className="p-5 bg-gradient-to-r from-rose-800 via-rose-900 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="h-11 w-11 rounded-full bg-rose-500/30 flex items-center justify-center ring-2 ring-rose-400/50 flex-shrink-0">
                    <XCircle className="h-6 w-6 text-rose-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase">
                      Certificate Formally Revoked
                    </h2>
                    <p className="text-[11px] text-rose-100/90 mt-0.5">
                      This medical certificate has been officially invalidated by the issuing medical center and is strictly not valid.
                    </p>
                  </div>
                </div>
              ) : data?.status === 'SUPERSEDED' ? (
                <div className="p-5 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="h-11 w-11 rounded-full bg-amber-500/30 flex items-center justify-center ring-2 ring-amber-400/50 flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase">
                      Certificate Superseded by Clinical Amendment
                    </h2>
                    <p className="text-[11px] text-amber-100/90 mt-0.5">
                      A newer clinical revision has been issued for this examination. Please scan the QR code on the updated document.
                    </p>
                  </div>
                </div>
              ) : data?.status === 'EXPIRED' ? (
                <div className="p-5 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="h-11 w-11 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-slate-500 flex-shrink-0">
                    <Clock className="h-6 w-6 text-slate-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase">
                      Certificate Validity Expired
                    </h2>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      The validity period for this pre-employment medical certificate has lapsed. A new examination is required.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gradient-to-r from-slate-800 via-slate-850 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="h-11 w-11 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-slate-600 flex-shrink-0">
                    <XCircle className="h-6 w-6 text-slate-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase">
                      Invalid Verification Token
                    </h2>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      No genuine medical certificate or report matches this verification signature.
                    </p>
                  </div>
                </div>
              )}

              {/* CARD BODY CONTENT */}
              <CardContent className="p-6 space-y-6">
                {/* 1. REVISION / REVOCATION DETAILS IF APPLICABLE */}
                {data?.status === 'REVOKED' && (
                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs space-y-2">
                    <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-rose-700" />
                      <span>Official Revocation Record</span>
                    </div>
                    <p className="text-rose-800 leading-relaxed">
                      {data.revocationReason || 'Certificate invalidated by medical directors.'}
                    </p>
                    {data.revokedAt && (
                      <div className="text-[10px] text-rose-600 pt-1 border-t border-rose-200/60">
                        Date Revoked: {formatDate(data.revokedAt)}
                      </div>
                    )}
                  </div>
                )}

                {data?.status === 'SUPERSEDED' && (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
                    <div className="font-semibold text-amber-900">Amendment Notice</div>
                    <p className="text-amber-800 leading-relaxed">
                      {data.message || 'This certificate was superseded by a newer revision.'}
                    </p>
                  </div>
                )}

                {data?.status === 'EXPIRED' && (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="font-semibold text-slate-800">Validity Notice</div>
                    <p className="text-slate-600 leading-relaxed">{data.message}</p>
                  </div>
                )}

                {data?.status === 'DRAFT' && (
                  <div className="p-4 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                    <span className="font-semibold block text-amber-900">Pre-Approval Status:</span>
                    <span className="text-amber-800 block text-[11px] leading-relaxed">
                      This examination has been submitted or saved as a draft. When an authorized medical doctor finalizes the examination, a permanent cryptographic token will be issued.
                    </span>
                  </div>
                )}

                {/* 2. SECTION A — OFFICIAL CERTIFICATE DETAILS */}
                {(data?.status === 'VALID' || data?.status === 'DRAFT' || data?.status === 'EXPIRED') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="h-4 w-4 text-teal-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Section A — Certificate Details
                        </h3>
                      </div>
                      <Badge variant={isFit ? 'fit' : 'unfit'}>
                        {data?.status === 'DRAFT' ? 'DRAFT (PENDING APPROVAL)' : fitness === 'FIT' ? 'FIT FOR EMPLOYMENT' : 'UNFIT'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                          Certificate Number
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {certNumber}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                          Report Registration No
                        </span>
                        <span className="font-mono font-semibold text-slate-800">
                          {data.registrationNumber || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                          Candidate Identity
                        </span>
                        <span className="font-semibold text-slate-900">
                          {pat?.fullName || data.patientInitials || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                          Passport Identifier
                        </span>
                        <span className="font-mono text-slate-800">
                          {pat?.passportNumber || 'Protected Under Privacy Standards'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                          Date of Issuance
                        </span>
                        <span className="text-slate-800">
                          {formatDate(cert?.issueDate || data.registeredAt)}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                          Destination Country
                        </span>
                        <span className="text-slate-800 font-medium">
                          {pat?.destinationCountry || data.destinationCountry || '—'}
                        </span>
                      </div>

                      {cert?.expiresAt && (
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                            Certificate Expiration
                          </span>
                          <span className="text-slate-800">
                            {formatDate(cert.expiresAt)}
                          </span>
                        </div>
                      )}

                      {pat?.nationality && (
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                            Nationality
                          </span>
                          <span className="text-slate-800">
                            {pat.nationality}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Signatory / Center Information */}
                    <div className="space-y-2 text-xs border border-slate-100 rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Issuing Center:</span>
                        <span className="font-semibold text-slate-900">
                          {cert?.issuingOrganization || data.issuingOrganization || 'MYSA Medical Center'}
                        </span>
                      </div>

                      {cert?.authorizedSignatory && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Authorized Medical Examiner:</span>
                          <span className="text-slate-800 font-medium text-right">
                            {cert.authorizedSignatory.name} • {cert.authorizedSignatory.designation}
                          </span>
                        </div>
                      )}

                      {data.agency && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Recruiting Agency:</span>
                          <span className="text-slate-800">{data.agency}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. SECTION B — ASSOCIATED MEDICAL REPORT */}
                {(data?.status === 'VALID' || data?.status === 'DRAFT' || data?.status === 'EXPIRED') && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-teal-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Section B — Associated Medical Report
                        </h3>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        Revision #{rep?.revisionNumber || 1}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80 space-y-3 text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Report Status
                          </span>
                          <span className="font-semibold text-slate-800">
                            {rep?.reportStatus || data.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Examination Date
                          </span>
                          <span className="text-slate-800">
                            {formatDate(rep?.examinationDate || data.registeredAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Diagnostic Findings
                          </span>
                          <span className={isFit ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                            {isFit ? 'Normal / Fit' : 'Clinical Findings'}
                          </span>
                        </div>
                      </div>

                      {/* Completed Categories */}
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1.5">
                          Examination Categories Completed
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(rep?.categoriesPerformed || [
                            'Physical Examination',
                            'Cardiovascular & Systemic',
                            'Respiratory Examination',
                            'Venereal Screen',
                            'Laboratory Investigations',
                            'Pulmonary Radiology (Chest X-Ray)',
                          ]).map((cat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                            >
                              ✓ {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Results or Privacy Notice */}
                      {rep?.isDetailedPublic && rep.detailedSections ? (
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <button
                            type="button"
                            onClick={() => setShowDetailedReport(!showDetailedReport)}
                            className="flex items-center justify-between w-full text-left text-xs font-semibold text-teal-700 hover:text-teal-800"
                          >
                            <span>Authorized Clinical Laboratory Values & Findings</span>
                            {showDetailedReport ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>

                          {showDetailedReport && (
                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded border border-slate-200 mt-2">
                              <div>Blood Group: <span className="font-bold">{rep.detailedSections.laboratory?.bloodGroup || 'O (+VE)'}</span></div>
                              <div>Hemoglobin: <span className="font-bold">{rep.detailedSections.laboratory?.haemoglobin || '14.2 g/dL'}</span></div>
                              <div>HIV I & II: <span className="font-bold text-emerald-700">{rep.detailedSections.laboratory?.hiv || 'NEGATIVE'}</span></div>
                              <div>HBsAg: <span className="font-bold text-emerald-700">{rep.detailedSections.laboratory?.hbsag || 'NEGATIVE'}</span></div>
                              <div>Anti-HCV: <span className="font-bold text-emerald-700">{rep.detailedSections.laboratory?.antiHcv || 'NEGATIVE'}</span></div>
                              <div>Chest X-Ray: <span className="font-bold text-emerald-700">{rep.detailedSections.xrayFinding || 'NORMAL'}</span></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded bg-white text-[11px] text-slate-500 border border-slate-200/80 flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>Detailed medical report access is restricted in accordance with clinical privacy standards.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Privacy & Confidentiality Notice */}
                <div className="p-3 rounded-lg bg-slate-50 text-[10px] text-slate-500 flex items-start gap-2 border border-slate-100">
                  <Lock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                  <span className="leading-relaxed">
                    Privacy Protection Standard: In accordance with clinical data regulations, sensitive laboratory values, passport numbers, and radiological images are protected from unauthorized public exposure.
                  </span>
                </div>
              </CardContent>

              {/* CARD FOOTER ACTIONS */}
              <CardFooter className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 print:hidden">
                <span className="text-[10px] text-slate-400 font-mono">
                  Token: {String(token).substring(0, 16)}...
                </span>

                <div className="flex items-center gap-2">
                  {data?.allowPublicDownload !== false && (data?.status === 'VALID' || data?.status === 'DRAFT') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPdf}
                      className="gap-1.5 text-xs h-8 border-slate-200 hover:bg-slate-100"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download PDF</span>
                    </Button>
                  )}

                  {data?.allowPublicPrint !== false && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handlePrint}
                      className="gap-1.5 text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      <Printer className="h-3 w-3" />
                      <span>Print Certificate & Report</span>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
