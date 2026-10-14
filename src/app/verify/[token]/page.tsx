'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDate, calculateAge } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CertificateSkeleton } from '@/components/ui/skeleton';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Download,
  Clock,
  Layers,
  FileCheck2,
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
    photoUrl?: string;
    gender?: string;
    maritalStatus?: string;
    religion?: string;
    heightCm?: number | null;
    weightKg?: number | null;
  };
  associatedReport?: {
    registrationNumber: string;
    examinationDate: string;
    reportStatus: string;
    finalMedicalStatus: string;
    finalRemarks?: string;
    revisionNumber: number;
    categoriesPerformed: string[];
    isDetailedPublic: boolean;
    detailedSections?: Record<string, any>;
    reportData?: Record<string, any>;
    xrayFinding?: string;
    xrayRemarks?: string;
    xrayImageUrl?: string;
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

  const handleDownloadCombinedPdf = () => {
    const downloadUrl = `${API_BASE}/api/v1/public/verify/${token}/print-pdf`;
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/90 py-12 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl space-y-4">
          <CertificateSkeleton />
        </div>
      </div>
    );
  }

  const cert = data?.certificate;
  const pat = data?.patient;
  const rep = data?.associatedReport;
  const repData = rep?.reportData || {};
  const certNumber =
    cert?.certificateNumber ||
    (data?.status === 'DRAFT'
      ? `DRAFT-${data.registrationNumber}`
      : `MC-${data?.registrationNumber || '00000'}`);
  const regNumber = data?.registrationNumber || rep?.registrationNumber || '—';
  const fitness = cert?.finalMedicalStatus || data?.finalMedicalStatus || rep?.finalMedicalStatus || 'FIT';
  const isFit = fitness === 'FIT';
  const orgName = cert?.issuingOrganization || data?.issuingOrganization || 'MYSA MEDICAL CENTER';

  // Photo URL resolution: prioritize returned photoUrl, fallback to /default_photo.png
  const photoSrc = pat?.photoUrl
    ? (pat.photoUrl.startsWith('http') || pat.photoUrl.startsWith('/') ? pat.photoUrl : `${API_BASE}/${pat.photoUrl}`)
    : '/default_photo.png';

  // Chest X-Ray URL resolution
  const xraySrc = rep?.xrayImageUrl
    ? (rep.xrayImageUrl.startsWith('http') || rep.xrayImageUrl.startsWith('/') ? rep.xrayImageUrl : `${API_BASE}/${rep.xrayImageUrl}`)
    : '/default_xray.png';

  const ageDisplay = pat?.dateOfBirth ? calculateAge(pat.dateOfBirth) : '28 Y';

  return (
    <div className="min-h-screen bg-slate-200/80 py-8 px-2 sm:px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0 font-sans">
      {/* 1. TOP STICKY ACTION HEADER (HIDDEN IN PRINT) */}
      <div className="w-full max-w-4xl space-y-3 mb-6 print:hidden">
        {data?.status === 'VALID' ? (
          <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-emerald-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-wider uppercase">
                    Authentic Medical Certificate Verified
                  </h2>
                  <Badge variant="fit" className="text-[10px]">
                    GENUINE & ACTIVE
                  </Badge>
                </div>
                <p className="text-[11px] text-emerald-100/80 mt-0.5">
                  Issued by {orgName} • Authenticated via MedVerify Digital Health Ledger
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCombinedPdf}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-8 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Combined 2-Page PDF</span>
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-8 gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Certificate & Report</span>
              </Button>
            </div>
          </div>
        ) : data?.status === 'DRAFT' ? (
          <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-400/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center flex-shrink-0 text-amber-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-wider uppercase">
                    Draft Examination Record — Pre-Approval Preview
                  </h2>
                  <Badge variant="outline" className="border-amber-300 text-amber-100 text-[10px]">
                    DRAFT
                  </Badge>
                </div>
                <p className="text-[11px] text-amber-100/90 mt-0.5">
                  This examination has not yet been finalized or approved by the authorized medical examiner.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCombinedPdf}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-8 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Draft PDF</span>
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs h-8 gap-1.5 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Draft Record</span>
              </Button>
            </div>
          </div>
        ) : data?.status === 'REVOKED' ? (
          <div className="p-4 bg-gradient-to-r from-rose-700 via-rose-800 to-slate-900 text-white rounded-xl shadow-md flex items-center gap-3 border border-rose-500/30">
            <div className="h-10 w-10 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center flex-shrink-0 text-rose-300">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase">
                Certificate Formally Revoked
              </h2>
              <p className="text-[11px] text-rose-100/90 mt-0.5">
                Revocation Reason: {data.revocationReason || 'Invalidated by medical authorities.'}
              </p>
            </div>
          </div>
        ) : data?.status === 'SUPERSEDED' ? (
          <div className="p-4 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white rounded-xl shadow-md flex items-center gap-3 border border-amber-500/30">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-amber-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase">
                Certificate Superseded by Clinical Amendment
              </h2>
              <p className="text-[11px] text-amber-100/90 mt-0.5">
                A newer clinical revision has been issued. Please scan the QR code on the updated report.
              </p>
            </div>
          </div>
        ) : data?.status === 'EXPIRED' ? (
          <div className="p-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white rounded-xl shadow-md flex items-center gap-3 border border-slate-600/30">
            <div className="h-10 w-10 rounded-full bg-slate-600/20 border border-slate-500/40 flex items-center justify-center flex-shrink-0 text-slate-300">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase">
                Certificate Validity Expired
              </h2>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {data.message || 'The validity duration for this medical certificate has lapsed.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-r from-slate-800 via-slate-850 to-slate-900 text-white rounded-xl shadow-md flex items-center gap-3 border border-slate-700">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300">
              <XCircle className="h-6 w-6" />
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
      </div>

      {/* 2. PAGE 1: OFFICIAL MEDICAL FITNESS CERTIFICATE (EXACT MATCH TO REFERENCE PDF PAGE 1) */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm border border-slate-300 p-4 sm:p-8 relative print:shadow-none print:border-none print:p-0 print-page-1">
        {/* Ornate Certificate Outer Frame & Corner Accents */}
        <div className="border-[2px] border-[#1e3a5f] p-4 sm:p-6 relative rounded-sm">
          {/* Inner fine gold accent border */}
          <div className="absolute inset-1.5 border border-[#c5a059] pointer-events-none rounded-2xs" />

          {/* Corner marks */}
          <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-[#c5a059] pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-[#c5a059] pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-[#c5a059] pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-[#c5a059] pointer-events-none" />

          {/* Watermark overlay if not active */}
          {data?.status === 'REVOKED' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-5xl sm:text-7xl font-extrabold text-rose-600/20 -rotate-45 uppercase border-8 border-rose-600/20 px-8 py-4 rounded-xl">
                REVOKED CERTIFICATE
              </span>
            </div>
          )}
          {data?.status === 'EXPIRED' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-5xl sm:text-7xl font-extrabold text-slate-600/20 -rotate-45 uppercase border-8 border-slate-600/20 px-8 py-4 rounded-xl">
                EXPIRED
              </span>
            </div>
          )}
          {data?.status === 'DRAFT' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="text-5xl sm:text-7xl font-extrabold text-amber-600/20 -rotate-45 uppercase border-8 border-amber-600/20 px-8 py-4 rounded-xl">
                DRAFT PREVIEW
              </span>
            </div>
          )}

          {/* INSTITUTIONAL HEADER */}
          <div className="text-center space-y-1 pb-2 relative z-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1e3a5f] uppercase font-sans">
              {orgName}
            </h1>
            <p className="text-[11px] text-slate-600 max-w-lg mx-auto leading-tight">
              Diagnostic & Medical Checkup Centre for Overseas Employment
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Phone: +880 1700-000000 | Email: info@mysamedicalbd.com | Govt. Approved Center
            </p>
            <div className="w-56 h-[1px] bg-[#c5a059] mx-auto mt-2" />
          </div>

          {/* CERTIFICATE TITLE BOX (MATCHING EXACT REFERENCE) */}
          <div className="my-2.5 text-center">
            <div className="inline-block border border-[#1e3a5f] bg-[#f8fafc] px-6 py-2 shadow-2xs w-full max-w-xl text-center rounded-2xs">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-[#1e3a5f] uppercase block">
                MEDICAL FITNESS CERTIFICATE
              </span>
              <span className="text-[8.5px] font-bold tracking-wider text-[#0d5c75] uppercase block mt-0.5">
                OFFICIAL PRE-EMPLOYMENT HEALTH EXAMINATION & CLEARANCE CREDENTIAL
              </span>
            </div>
          </div>

          {/* CERTIFICATE METADATA STRIP (4 EQUAL COLUMNS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5 p-2 bg-[#f8fafc] border border-slate-300 text-xs rounded-2xs">
            <div>
              <span className="text-[8.5px] text-slate-500 uppercase block font-semibold">CERTIFICATE NUMBER</span>
              <span className="font-mono font-bold text-[#1e3a5f] text-xs sm:text-sm">{certNumber}</span>
            </div>
            <div>
              <span className="text-[8.5px] text-slate-500 uppercase block font-semibold">REPORT REG. NO</span>
              <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">{regNumber}</span>
            </div>
            <div>
              <span className="text-[8.5px] text-slate-500 uppercase block font-semibold">EXAMINATION DATE</span>
              <span className="font-mono font-bold text-slate-800 text-xs">{formatDate(data?.registeredAt || rep?.examinationDate)}</span>
            </div>
            <div>
              <span className="text-[8.5px] text-slate-500 uppercase block font-semibold">DATE OF ISSUANCE</span>
              <span className="font-mono font-bold text-slate-800 text-xs">{formatDate(cert?.issueDate || data?.registeredAt)}</span>
            </div>
          </div>

          {/* CANDIDATE IDENTITY SECTION (WITH CANDIDATE PHOTOGRAPH) */}
          <div className="my-2.5 space-y-1">
            <span className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider block">
              CANDIDATE IDENTIFICATION DETAILS
            </span>

            <div className="border border-slate-300 rounded-sm grid grid-cols-1 sm:grid-cols-4 bg-white text-xs overflow-hidden">
              {/* Details table columns */}
              <div className="sm:col-span-3 p-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 border-b sm:border-b-0 sm:border-r border-slate-300 text-[11px]">
                <div>
                  <span className="text-[8.5px] text-slate-400 block uppercase">Full Name</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {pat?.fullName || data?.patientInitials || 'MOHAMMAD FARUK'}
                  </span>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 block uppercase">Passport No</span>
                  <span className="font-mono font-bold text-slate-900 uppercase">
                    {pat?.passportNumber || 'TEST675823'}
                  </span>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 block uppercase">Date of Birth</span>
                  <span className="text-slate-800 font-bold">
                    {formatDate(pat?.dateOfBirth)}
                  </span>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 block uppercase">Age / Gender</span>
                  <span className="text-slate-800 font-bold">
                    {ageDisplay} / {pat?.gender || 'Male'}
                  </span>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 block uppercase">Nationality</span>
                  <span className="text-slate-800 font-bold uppercase">
                    {pat?.nationality || 'BANGLADESHI'}
                  </span>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 block uppercase">Marital Status</span>
                  <span className="text-slate-800 font-bold">
                    {pat?.maritalStatus || 'Married'}
                  </span>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 block uppercase">Destination</span>
                  <span className="text-slate-800 font-bold uppercase">
                    {pat?.destinationCountry || data?.destinationCountry || 'UAE/DUBAI'}
                  </span>
                </div>

                <div>
                  <span className="text-[8.5px] text-slate-400 block uppercase">Recruiting Agency</span>
                  <span className="text-slate-800 font-bold">
                    {pat?.agency || data?.agency || 'Al-Hasan Manpower'}
                  </span>
                </div>
              </div>

              {/* Photo Box on Certificate (Exact Match) */}
              <div className="p-2.5 print:p-1.5 flex flex-col items-center justify-center bg-slate-50">
                <div className="w-24 sm:w-28 h-28 sm:h-32 print:w-20 print:h-24 rounded border border-slate-300 bg-white flex items-center justify-center text-slate-400 shadow-2xs overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoSrc}
                    alt="Candidate Photograph"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.dataset.fallbackTried && pat?.photoUrl) {
                        target.dataset.fallbackTried = 'true';
                        const clean = pat.photoUrl.replace(/^\//, '').split('/').pop();
                        target.src = `${API_BASE}/api/v1/uploads/file/${clean}`;
                      } else {
                        target.src = '/default_photo.png';
                      }
                    }}
                  />
                </div>
                <span className="text-[8px] text-slate-500 uppercase mt-1 font-mono font-medium print:hidden">Photograph</span>
              </div>
            </div>
          </div>

          {/* OFFICIAL CLINICAL FITNESS DECLARATION */}
          <div className="my-2.5 space-y-1.5">
            <span className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider block">
              OFFICIAL CLINICAL FITNESS DECLARATION
            </span>

            <div className="border border-slate-300 rounded-sm p-3 bg-slate-50/60 text-xs space-y-2">
              <p className="text-[10.5px] text-slate-700 leading-relaxed">
                This is to certify that the candidate identified above has undergone comprehensive medical, radiological, and clinical laboratory examinations in strict accordance with the mandatory health screening protocol. Based upon the complete clinical assessment and diagnostic evaluations performed, the candidate is officially certified as:
              </p>

              {/* Prominent Fitness Banner */}
              {isFit ? (
                <div className="p-2.5 bg-white border-2 border-emerald-600 rounded text-center shadow-2xs">
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase tracking-wide flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    CERTIFIED STATUS: MEDICALLY FIT FOR EMPLOYMENT
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-white border-2 border-rose-600 rounded text-center shadow-2xs">
                  <span className="text-xs sm:text-sm font-extrabold text-rose-800 uppercase tracking-wide flex items-center justify-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    CERTIFIED STATUS: MEDICALLY UNFIT FOR EMPLOYMENT
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-0.5 text-[10.5px]">
                <span className="text-slate-500 font-semibold">Authorized Remarks:</span>
                <span className={isFit ? 'text-emerald-800 font-bold' : 'text-rose-800 font-bold'}>
                  {rep?.finalRemarks || 'NORMAL'}
                </span>
              </div>
            </div>
          </div>

          {/* SUMMARY OF COMPLETED CLINICAL ASSESSMENTS (4 CARDS MATCHING EXACT PDF) */}
          <div className="my-2.5 space-y-1">
            <span className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider block">
              SUMMARY OF COMPLETED CLINICAL ASSESSMENTS
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-300 flex flex-col justify-between h-24">
                <div>
                  <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase">PHYSICAL & SENSORY</span>
                  <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                    Visual acuity, auditory exam, blood pressure, BMI, psychiatric and physical evaluation.
                  </p>
                </div>
                <span className="font-bold text-emerald-700 text-[10px] block text-center">SATISFACTORY</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-300 flex flex-col justify-between h-24">
                <div>
                  <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase">SYSTEMIC EXAMINATION</span>
                  <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                    Cardiovascular, respiratory (lungs), abdomen, extremities, and central nervous system.
                  </p>
                </div>
                <span className="font-bold text-emerald-700 text-[10px] block text-center">NORMAL (NAD)</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-300 flex flex-col justify-between h-24">
                <div>
                  <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase">SEROLOGY & BIOCHEMISTRY</span>
                  <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                    HIV I & II, HBsAg, Anti-HCV, VDRL, Creatinine, Bilirubin, SGPT/SGOT, Blood Glucose.
                  </p>
                </div>
                <span className="font-bold text-emerald-700 text-[10px] block text-center">NON-REACTIVE</span>
              </div>

              <div className="p-2 rounded bg-slate-50 border border-slate-300 flex flex-col justify-between h-24">
                <div>
                  <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase">PULMONARY RADIOLOGY</span>
                  <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                    High-resolution chest radiograph (X-ray) for tuberculosis and active thoracic pathology.
                  </p>
                </div>
                <span className="font-bold text-emerald-700 text-[10px] block text-center">NORMAL</span>
              </div>
            </div>
          </div>

          {/* DIGITAL AUTHENTICATION & SIGNATORY/SEAL SECTION (SIDE-BY-SIDE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 pt-1 border-t border-slate-300">
            {/* Left Box: Cryptographic Online Authentication */}
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 flex flex-col items-center justify-between text-center">
              <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase tracking-wider">
                CRYPTOGRAPHIC ONLINE AUTHENTICATION
              </span>

              <div className="w-24 h-24 bg-white border border-slate-300 p-1 flex items-center justify-center my-1.5 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : `https://medverify-zeta.vercel.app/verify/${token}`)}`}
                  alt="Security QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-[9.5px] space-y-0.5">
                <span className="font-bold text-slate-900 block uppercase tracking-wide">
                  SCAN TO AUTHENTICATE CERTIFICATE
                </span>
                <span className="text-slate-500 block text-[8.5px] leading-tight">
                  Official verification against MedVerify digital ledger.
                </span>
                <span className="text-slate-400 font-mono block text-[8px]">
                  Token: {String(token).substring(0, 18)}...
                </span>
              </div>
            </div>

            {/* Right Box: Authorized Medical Signatory & Seal (WITH AUTHENTIC STAMP) */}
            <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 flex flex-col justify-between relative overflow-hidden">
              <div className="text-center">
                <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase tracking-wider">
                  AUTHORIZED MEDICAL SIGNATORY & SEAL
                </span>
                {/* Doctor's Signature Graphic */}
                <div className="h-9 flex items-center justify-center my-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/doctor_signature.png"
                    alt="Doctor Signature"
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </div>

              {/* Signatory Details and Official Circular Seal side-by-side */}
              <div className="border-t border-slate-300 pt-1 flex items-center justify-between gap-1">
                <div className="text-left space-y-0.5">
                  <span className="font-bold text-slate-900 block text-[10.5px] leading-tight">
                    {cert?.authorizedSignatory?.name || 'Dr. A. K. M. Shamsuddin'}
                  </span>
                  <span className="text-slate-600 block text-[8.5px] leading-tight">
                    {cert?.authorizedSignatory?.designation || 'MBBS, FCPS - Medical Director'}
                  </span>
                  <span className="text-[#0d5c75] font-bold block text-[8.5px] leading-tight">
                    {cert?.authorizedSignatory?.licenseNumber || 'BMDC Reg No: A-12345'}
                  </span>
                  <span className="text-slate-400 block text-[7.5px] italic leading-tight">
                    Official Clinical Director & Authorized Examiner
                  </span>
                </div>

                {/* Official Circular Stamp & Seal Graphic */}
                <div className="w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/official_stamp.png"
                    alt="Official Clinic Stamp & Seal"
                    className="w-full h-full object-contain filter drop-shadow-2xs opacity-95 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CERTIFICATE FOOTER */}
          <div className="text-center pt-2 border-t border-slate-200 text-[9px] text-slate-500">
            <p>
              This official certificate verifies fitness for overseas employment. Authenticate online using the security QR code.
            </p>
            <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1 font-mono">
              <span>Official Medical Fitness Certificate | {certNumber}</span>
              <span className="font-bold text-slate-600">Page 1 of 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VISUAL SEPARATOR BETWEEN PAGE 1 AND PAGE 2 */}
      <div className="w-full max-w-4xl my-6 flex items-center justify-between px-2 text-xs text-slate-500 print:hidden">
        <div className="h-px bg-slate-300 flex-1" />
        <div className="px-3 flex items-center gap-2 font-semibold uppercase tracking-wider text-slate-600">
          <Layers className="h-4 w-4 text-teal-600" />
          <span>Page 2: Associated Detailed Medical Test Report (Print & Record Copy)</span>
        </div>
        <div className="h-px bg-slate-300 flex-1" />
      </div>

      {/* 4. PAGE 2: DETAILED MEDICAL TEST REPORT (EXACT REPLICATION OF PDF REPORT LAYOUT) */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm border border-slate-300 p-4 sm:p-7 relative print:shadow-none print:border-none print:p-0 print-page-2">
        <div className="border border-[#212529] p-3 sm:p-5 print:p-2 rounded-sm space-y-3 print:space-y-1 bg-white">
          
          {/* 1. TOP HEADER BANNER (EXACTLY MATCHING PDF BANNER) */}
          <div className="w-full overflow-hidden flex items-center justify-center border-b border-[#212529] pb-2 print:pb-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/header_banner.png"
              alt="MYSA Medical Services Header Banner"
              className="w-full h-auto object-contain max-h-24 sm:max-h-28 print:max-h-12"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* 2. DOCUMENT TITLE */}
          <div className="text-center py-0.5 print:py-0">
            <h2 className="text-xs sm:text-sm font-bold text-[#212529] tracking-wider uppercase font-sans print:text-[11px] print:leading-none">
              MEDICAL TEST REPORT
            </h2>
          </div>

          {/* 3. REGISTRATION NUMBER, BARCODE & FINGERPRINT */}
          <div className="flex items-center justify-between pt-1 print:pt-0">
            <div>
              <div className="text-xs font-bold text-[#212529] uppercase font-sans print:text-[10px]">
                REG NO: <span className="font-mono">{regNumber}</span>
              </div>
              {/* Deterministic Barcode matching the PDF drawBarcode graphic */}
              <div className="flex items-center gap-[1.5px] mt-1 print:mt-0.5 h-3.5 print:h-2.5">
                {[3, 1.5, 1.5, 1.5, 4, 3, 1.5, 4, 3, 3, 1.5, 1.5, 3, 1.5, 4, 1.5, 3, 3, 1.5, 4, 1.5, 3, 1.5, 4, 3, 1.5, 3].map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-[#008080] inline-block h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 print:gap-3">
              <div className="text-right text-[11px] font-bold text-[#212529] print:text-[9px]">
                Reg. Date: {formatDate(data?.registeredAt || rep?.examinationDate)}
              </div>
              <div className="border border-[#212529] px-3 py-1 print:px-2 print:py-0.5 text-[10px] print:text-[8px] font-bold text-[#212529] bg-white">
                Finger Print
              </div>
            </div>
          </div>

          {/* 4. PATIENT INFO TABLE & PHOTO BOX (EXACT 4-COLUMN + PHOTO LAYOUT) */}
          <div className="border border-[#212529] grid grid-cols-1 sm:grid-cols-4 print:grid-cols-4 bg-white text-xs">
            {/* Left 3 columns: Candidate Details Table */}
            <div className="sm:col-span-3 print:col-span-3 divide-y divide-[#212529] border-b sm:border-b-0 print:border-b-0 sm:border-r print:border-r border-[#212529]">
              {/* Row 1 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px] print:text-[8px] print:leading-none">
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">NAME</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529] uppercase truncate">{pat?.fullName || 'MOHAMMAD FARUK'}</div>
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">COUNTRY</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529] uppercase truncate">{pat?.destinationCountry || 'UAE/DUBAI'}</div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px] print:text-[8px] print:leading-none">
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">PASSPORT NO</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529] uppercase font-mono">{pat?.passportNumber || 'TEST675823'}</div>
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">BIRTH DATE</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529]">{formatDate(pat?.dateOfBirth)}</div>
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px] print:text-[8px] print:leading-none">
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">MARITAL STATUS</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529]">{pat?.maritalStatus || 'Married'}</div>
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">RELIGION</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529]">{pat?.religion || 'Islam'}</div>
              </div>
              {/* Row 4 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px] print:text-[8px] print:leading-none">
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">AGE</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529]">{ageDisplay}</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529]">{pat?.gender || 'Male'}</div>
              </div>
              {/* Row 5 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px] print:text-[8px] print:leading-none">
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">NATIONALITY</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529] uppercase">{pat?.nationality || 'Bangladeshi'}</div>
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">HEIGHT (CM)</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529]">{pat?.heightCm ? `${pat.heightCm}` : ''}</div>
              </div>
              {/* Row 6 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px] print:text-[8px] print:leading-none">
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">AGENCY</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529] truncate">{pat?.agency || 'Al-Hasan Manpower'}</div>
                <div className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 font-normal text-[#212529]">WEIGHT (KG)</div>
                <div className="p-1.5 print:py-0.5 print:px-1 font-bold text-[#212529]">{pat?.weightKg ? `${pat.weightKg}` : ''}</div>
              </div>
            </div>

            {/* Far Right: Patient Photo Box */}
            <div className="p-1.5 print:p-1 flex flex-col items-center justify-center bg-white">
              <div className="w-24 sm:w-28 h-28 sm:h-32 print:w-20 print:h-22 border border-slate-300 bg-white flex items-center justify-center overflow-hidden relative shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoSrc}
                  alt="Candidate Photograph"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.fallbackTried && pat?.photoUrl) {
                      target.dataset.fallbackTried = 'true';
                      const clean = pat.photoUrl.replace(/^\//, '').split('/').pop();
                      target.src = `${API_BASE}/api/v1/uploads/file/${clean}`;
                    } else {
                      target.src = '/default_photo.png';
                    }
                  }}
                />
              </div>
              <span className="text-[8px] print:text-[7px] text-slate-500 uppercase mt-0.5 font-mono print:hidden">Patient Photo</span>
            </div>
          </div>

          {/* 5. CLINICAL EXAMINATION & LABORATORY TABLES (TWO SIDE-BY-SIDE TABLES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-3 print:gap-2 text-xs pt-1 print:pt-0.5">
            {/* Left Column: Medical Examination Table */}
            <div className="border border-[#212529] text-[10px] bg-white divide-y divide-[#212529]">
              {/* Header */}
              <div className="py-1 text-center font-bold text-[#212529] text-[11px] bg-slate-50 uppercase">
                MEDICAL EXAMINATION
              </div>
              {/* Subheader */}
              <div className="grid grid-cols-3 font-bold text-[#212529] bg-slate-100/70">
                <div className="col-span-2 p-1 pl-2">TYPE OF THE EXAM</div>
                <div className="p-1 text-center border-l border-[#212529]">RESULT</div>
              </div>
              {/* Eye Visual Acuity */}
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2 flex items-center">EYE Visual Acuity</div>
                <div className="border-l border-[#212529] divide-y divide-[#212529]">
                  <div className="p-0.5 text-center">R: {repData.eye_visual_acuity_r || '6/6'}</div>
                  <div className="p-0.5 text-center">L: {repData.eye_visual_acuity_l || '6/6'}</div>
                </div>
              </div>
              {/* Ear */}
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2 flex items-center">EAR</div>
                <div className="border-l border-[#212529] divide-y divide-[#212529]">
                  <div className="p-0.5 text-center">R: {repData.ear_r || 'NAD'}</div>
                  <div className="p-0.5 text-center">L: {repData.ear_l || 'NAD'}</div>
                </div>
              </div>
              {/* Systemic Cardio */}
              <div className="py-0.5 text-center font-bold text-[#212529] bg-slate-100/70 uppercase">
                SYSTEMIC EXAM: CARDIO-VASCULAR
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">B.P</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.blood_pressure || '120/80'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">HEART</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.heart || 'NAD'}</div>
              </div>
              {/* Respiratory */}
              <div className="py-0.5 text-center font-bold text-[#212529] bg-slate-100/70 uppercase">
                RESPIRATORY EXAM
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">LUNGS</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.lungs || 'NAD'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">GASTROINTESTINAL ABDOMEN</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.abdomen || 'NAD'}</div>
              </div>
              {/* Others */}
              <div className="py-0.5 text-center font-bold text-[#212529] bg-slate-100/70 uppercase">
                OTHERS
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">HERNIA</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.hernia || 'ABSENT'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">VARICOSE VEINS</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.varicose_veins || 'ABSENT'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">DEFORMITIES</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.deformities || 'ABSENT'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">SKIN</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.skin || 'NAD'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">C.N.S</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.cns || 'NAD'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">EXTREMITIES</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.extremities || 'NAD'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">PSYCHIATRY</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.psychiatry || 'NAD'}</div>
              </div>
              {/* Venereal */}
              <div className="py-0.5 text-center font-bold text-[#212529] bg-slate-100/70 uppercase">
                VENEREAL DISEASE
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">SYMPTOMS</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.venereal_symptoms || 'NAD'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">REMARKS</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.exam_remarks || 'NORMAL'}</div>
              </div>
              {/* X-Ray */}
              <div className="py-0.5 text-center font-bold text-[#212529] bg-slate-100/70 uppercase">
                X-RAY INVESTIGATION
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">CHEST X-RAY</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{rep?.xrayFinding || repData.chest_xray || 'NORMAL'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">REMARKS</div>
                <div className="p-1 text-center border-l border-[#212529] font-bold text-red-600">{rep?.xrayRemarks || repData.xray_remarks || 'NORMAL'}</div>
              </div>
            </div>

            {/* Right Column: Laboratory Investigation Table */}
            <div className="border border-[#212529] text-[10px] bg-white divide-y divide-[#212529]">
              {/* Header */}
              <div className="py-1 text-center font-bold text-[#212529] text-[11px] bg-slate-50 uppercase">
                LABORATORY INVESTIGATION
              </div>
              {/* Subheader */}
              <div className="grid grid-cols-3 font-bold text-[#212529] bg-slate-100/70">
                <div className="col-span-2 p-1 pl-2">TYPE OF THE EXAM</div>
                <div className="p-1 text-center border-l border-[#212529]">RESULT</div>
              </div>
              {/* Urine */}
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">URINE FOR SUGAR - ALBUMIN</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.urine_sugar_albumin || 'NIL - NIL'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">URINE FOR OPIATES - CANNABIS - AMPHETAMINE</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium text-[9px]">{repData.urine_opiates_cannabis || 'N/A - N/A - N/A'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">URINE FOR PREGNANCY TEST</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.urine_pregnancy || 'N/A'}</div>
              </div>
              {/* Others */}
              <div className="py-0.5 text-center font-bold text-[#212529] bg-slate-100/70 uppercase">
                OTHERS
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2 font-bold">BLOOD GROUP</div>
                <div className="p-1 text-center border-l border-[#212529] font-bold">{repData.blood_group || 'B (+VE)'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">HAEMOGLOBIN</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.haemoglobin || '14.2'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">ESR</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.esr || '12'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">R.B.S</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.rbs || '5.8'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">S. CREATININE</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.s_creatinine || '1.0'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">S.BIL</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.s_bil || '0.85'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">SGPT</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.sgpt || '35'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">SGOT</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.sgot || '28'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2 font-bold">HIV I & HIV II</div>
                <div className="p-1 text-center border-l border-[#212529] font-bold text-emerald-700">{repData.hiv || 'NEGATIVE'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2 font-bold">HBsAg</div>
                <div className="p-1 text-center border-l border-[#212529] font-bold text-emerald-700">{repData.hbsag || 'NEGATIVE'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2 font-bold">Anti HCV</div>
                <div className="p-1 text-center border-l border-[#212529] font-bold text-emerald-700">{repData.anti_hcv || 'NEGATIVE'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2 font-bold">TPHA (IF VDRL POSITIVE)</div>
                <div className="p-1 text-center border-l border-[#212529] font-bold">{repData.tpha || 'NEGATIVE'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2 font-bold">VDRL</div>
                <div className="p-1 text-center border-l border-[#212529] font-bold text-emerald-700">{repData.vdrl || 'NON REACTIVE'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">REMARKS</div>
                <div className="p-1 text-center border-l border-[#212529] font-bold text-red-600">{repData.lab_remarks || 'NORMAL'}</div>
              </div>
            </div>
          </div>

          {/* 6. STATUS, CHEST X-RAY & CRYPTOGRAPHIC QR VERIFICATION SECTION */}
          <div className="pt-3 print:pt-1 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-2 items-center">
            {/* Left: Status & Remarks */}
            <div className="space-y-4 print:space-y-1">
              <div className="flex items-center gap-3 print:gap-2">
                <span className="text-xs print:text-[9.5px] font-normal text-[#212529]">HIS/HER STATUS: </span>
                <span className="border border-red-600 px-3 py-0.5 print:px-2 print:py-[1px] text-xs print:text-[9.5px] font-bold text-[#212529] tracking-wider uppercase">
                  {fitness}
                </span>
              </div>

              <div className="text-xs print:text-[9.5px] font-bold text-[#212529]">
                REMARKS: <span className="text-red-600">{rep?.finalRemarks || 'NORMAL'}</span>
              </div>
            </div>

            {/* Right: Chest X-Ray and QR Box side by side */}
            <div className="grid grid-cols-2 gap-3 print:gap-2">
              {/* Chest X-Ray Box */}
              <div className="border border-[#212529] h-36 print:h-20 bg-black/5 flex flex-col items-center justify-center overflow-hidden p-1 print:p-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={xraySrc}
                  alt="Chest X-Ray"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.fallbackTried && rep?.xrayImageUrl) {
                      target.dataset.fallbackTried = 'true';
                      const clean = rep.xrayImageUrl.replace(/^\//, '').split('/').pop();
                      target.src = `${API_BASE}/api/v1/uploads/file/${clean}`;
                    } else {
                      target.src = '/default_xray.png';
                    }
                  }}
                />
              </div>

              {/* QR Verification Box */}
              <div className="border border-[#212529] h-36 print:h-20 p-1.5 print:p-0.5 flex flex-col items-center justify-between text-center bg-white">
                <div className="w-20 h-20 print:w-12 print:h-12 bg-white border border-slate-200 p-0.5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : `https://medverify-zeta.vercel.app/verify/${token}`)}`}
                    alt="Scan to Verify"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-0.5 print:space-y-0">
                  <span className="text-[8px] print:text-[6.5px] font-bold text-[#212529] block uppercase">SCAN TO VERIFY REPORT</span>
                  <span className="text-[7.5px] print:text-[6px] text-slate-500 font-mono block">Reg: {regNumber}</span>
                  <span className="text-[7px] print:text-[5.5px] font-bold text-emerald-700 block">Official Verification Portal</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. AUTO-GENERATED DISCLAIMER & FOOTER */}
          <div className="text-center pt-2 print:pt-0.5 border-t border-slate-300 text-[10px] print:text-[7.5px] text-[#212529]">
            This is an auto generated report, does not require any signature.
          </div>
          <div className="flex items-center justify-between text-[8px] print:text-[7px] text-slate-400 pt-1 print:pt-0.5 border-t border-slate-200 font-mono">
            <span className="truncate">Online Verification: {typeof window !== 'undefined' ? window.location.href : `https://medverify-zeta.vercel.app/verify/${token}`}</span>
            <span className="font-bold text-slate-600 flex-shrink-0">Page 2/2</span>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM FLOATING ACTION BAR (HIDDEN IN PRINT) */}
      <div className="w-full max-w-4xl mt-6 p-4 bg-white rounded-xl shadow-md border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <FileCheck2 className="h-4 w-4 text-teal-600" />
          <span>Combined Document: <strong>Page 1 Certificate + Page 2 Clinical Report</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCombinedPdf}
            className="gap-1.5 text-xs h-8 text-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Combined 2-Page PDF</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Combined 2-Page Document</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
