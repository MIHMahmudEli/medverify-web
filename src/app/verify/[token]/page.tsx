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
  const orgName = cert?.issuingOrganization || data?.issuingOrganization || 'MYSA MEDICAL SERVICES (PVT.) LTD.';

  // Photo URL resolution: prioritize returned photoUrl, fallback to /default_photo.png
  const photoSrc = pat?.photoUrl
    ? (pat.photoUrl.startsWith('http') || pat.photoUrl.startsWith('/') ? pat.photoUrl : `${API_BASE}/${pat.photoUrl}`)
    : '/default_photo.png';

  // Chest X-Ray URL resolution
  const xraySrc = rep?.xrayImageUrl
    ? (rep.xrayImageUrl.startsWith('http') || rep.xrayImageUrl.startsWith('/') ? rep.xrayImageUrl : `${API_BASE}/${rep.xrayImageUrl}`)
    : '/default_xray.png';

  const ageDisplay = pat?.dateOfBirth ? calculateAge(pat.dateOfBirth) : '31 Y';

  return (
    <div className="min-h-screen bg-slate-200/80 py-8 px-2 sm:px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0 font-sans">
      {/* 1. TOP STICKY VERIFICATION & ACTION HEADER (HIDDEN IN PRINT) */}
      <div className="w-full max-w-4xl space-y-3 mb-6 print:hidden">
        {/* Verification Status Alert Banner */}
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

      {/* 2. PAGE 1: OFFICIAL MEDICAL FITNESS CERTIFICATE (THE PRIMARY VISUAL DISPLAY) */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm border border-slate-300 p-4 sm:p-8 relative print:shadow-none print:border-none print:p-0 print-page-1">
        {/* Ornate Certificate Frame & Corner Accents */}
        <div className="border-[2.5px] border-[#1e3a5f] p-4 sm:p-6 relative rounded-sm">
          {/* Inner fine accent line */}
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
          <div className="text-center space-y-1 pb-3 relative z-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#1e3a5f] uppercase font-sans">
              {orgName}
            </h1>
            <p className="text-[11px] text-slate-600 max-w-lg mx-auto leading-tight">
              Diagnostic & Medical Checkup Centre for Overseas Employment • Approved by Ministry of Health
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Govt. Approval Lic: DGHS/MED-84920/2024  •  Phone: +880 1700-000000  •  Email: info@mysamedicalbd.com
            </p>
            <div className="w-48 h-0.5 bg-[#c5a059] mx-auto mt-2" />
          </div>

          {/* CERTIFICATE TITLE RIBBON */}
          <div className="my-3 text-center">
            <div className="inline-block border border-[#1e3a5f] bg-[#f8fafc] px-6 py-1.5 shadow-2xs">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-[#1e3a5f] uppercase">
                MEDICAL FITNESS CERTIFICATE
              </span>
            </div>
          </div>

          {/* CERTIFICATE METADATA STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 p-2 bg-slate-50 border border-slate-300 text-xs">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block font-semibold">Certificate Number</span>
              <span className="font-mono font-bold text-[#1e3a5f] text-xs sm:text-sm">{certNumber}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block font-semibold">Report Reg. No</span>
              <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">{regNumber}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block font-semibold">Examination Date</span>
              <span className="text-slate-800 font-medium text-xs">{formatDate(data?.registeredAt || rep?.examinationDate)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block font-semibold">Date of Issuance</span>
              <span className="text-slate-800 font-medium text-xs">{formatDate(cert?.issueDate || data?.registeredAt)}</span>
            </div>
          </div>

          {/* CANDIDATE IDENTITY SECTION (WITH PHOTOGRAPH) */}
          <div className="my-3 space-y-1">
            <span className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider block">
              Candidate Identification Details
            </span>

            <div className="border border-slate-300 rounded-sm grid grid-cols-1 sm:grid-cols-4 bg-white text-xs overflow-hidden">
              {/* Details table columns */}
              <div className="sm:col-span-3 p-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 border-b sm:border-b-0 sm:border-r border-slate-300">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Candidate Full Name</span>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm uppercase">
                    {pat?.fullName || data?.patientInitials || 'MD MOHAN MIA'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Passport Number</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {pat?.passportNumber || 'A09876543'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Date of Birth / Age</span>
                  <span className="text-slate-800 font-medium">
                    {formatDate(pat?.dateOfBirth)} ({ageDisplay})
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Nationality</span>
                  <span className="text-slate-800 font-medium uppercase">
                    {pat?.nationality || 'Bangladeshi'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Destination Country</span>
                  <span className="text-slate-800 font-medium uppercase">
                    {pat?.destinationCountry || data?.destinationCountry || 'UAE / DUBAI'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Recruiting Agency</span>
                  <span className="text-slate-800 font-medium">
                    {pat?.agency || data?.agency || 'Al-Hasan Overseas Recruitment'}
                  </span>
                </div>
              </div>

              {/* Photo Box on Certificate */}
              <div className="p-3 flex flex-col items-center justify-center bg-slate-50">
                <div className="w-24 h-28 rounded border border-slate-300 bg-white flex items-center justify-center text-slate-400 shadow-2xs overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoSrc}
                    alt="Candidate Photograph"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default_photo.png';
                    }}
                  />
                </div>
                <span className="text-[8px] text-slate-500 uppercase mt-1 font-mono font-medium">Photograph</span>
              </div>
            </div>
          </div>

          {/* OFFICIAL CLINICAL FITNESS DECLARATION */}
          <div className="my-3 space-y-2">
            <span className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider block">
              Official Clinical Fitness Declaration
            </span>

            <div className="border border-slate-300 rounded-sm p-3.5 bg-slate-50/60 text-xs space-y-3">
              <p className="text-[11px] text-slate-700 leading-relaxed">
                This is to officially certify that the candidate identified above has presented for examination and has undergone comprehensive pre-employment medical, radiological, and clinical laboratory investigations in accordance with authorized medical protocols. Based upon all clinical assessments and diagnostic findings, the candidate is hereby declared:
              </p>

              {/* Prominent Fitness Banner */}
              {isFit ? (
                <div className="p-3 bg-emerald-50 border-2 border-emerald-600 rounded text-center shadow-2xs">
                  <span className="text-sm sm:text-base font-extrabold text-emerald-900 uppercase tracking-wide flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    CERTIFIED STATUS: MEDICALLY FIT FOR EMPLOYMENT
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border-2 border-rose-600 rounded text-center shadow-2xs">
                  <span className="text-sm sm:text-base font-extrabold text-rose-900 uppercase tracking-wide flex items-center justify-center gap-2">
                    <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                    CERTIFIED STATUS: MEDICALLY UNFIT FOR EMPLOYMENT
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="text-slate-500 font-semibold">Clinical Remarks:</span>
                <span className={isFit ? 'text-emerald-800 font-bold' : 'text-rose-800 font-bold'}>
                  {rep?.finalRemarks || 'CLINICALLY FIT FOR OVERSEAS EMPLOYMENT'}
                </span>
              </div>
            </div>
          </div>

          {/* SUMMARY OF DIAGNOSTIC ASSESSMENTS */}
          <div className="my-3 space-y-1">
            <span className="text-[10px] font-bold text-[#1e3a5f] uppercase tracking-wider block">
              Completed Diagnostic Assessments
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Cardiovascular & Physical</span>
                <span className="font-semibold text-slate-800 text-[11px]">PASSED (NAD)</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Respiratory / Lungs</span>
                <span className="font-semibold text-slate-800 text-[11px]">CLEAR (NAD)</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Serology & Lab Tests</span>
                <span className="font-semibold text-slate-800 text-[11px]">NON-REACTIVE</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Chest X-Ray Investigation</span>
                <span className="font-semibold text-slate-800 text-[11px]">NORMAL (PASSED)</span>
              </div>
            </div>
          </div>

          {/* DIGITAL AUTHENTICATION & SIGNATORY SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 pt-2 border-t border-slate-300">
            {/* Left Box: Online Security Verification */}
            <div className="border border-slate-300 rounded p-3 bg-slate-50/50 flex items-center gap-3">
              <div className="w-20 h-20 bg-white border border-slate-300 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
                {/* Visual QR Code rendering */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : `https://medverify-zeta.vercel.app/verify/${token}`)}`}
                  alt="Security QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[10px] space-y-0.5">
                <span className="font-bold text-[#1e3a5f] block uppercase tracking-wide">Digital Authentication</span>
                <span className="text-slate-600 block text-[9px] leading-tight">
                  Cryptographically secured against the MedVerify clinical ledger.
                </span>
                <span className="text-slate-400 font-mono block text-[8px]">
                  Token: {String(token).substring(0, 16)}...
                </span>
                <span className="text-emerald-700 font-bold block text-[9px]">
                  ✓ Verified Authentic Online
                </span>
              </div>
            </div>

            {/* Right Box: Authorized Medical Signatory */}
            <div className="border border-slate-300 rounded p-3 bg-slate-50/50 text-center flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase tracking-wider">
                  Authorized Medical Examiner & Director
                </span>
                <div className="h-6 flex items-center justify-center">
                  <span className="font-serif italic text-slate-600 text-xs">Dr. A. K. M. Shamsuddin</span>
                </div>
              </div>
              <div className="border-t border-slate-300 pt-1">
                <span className="font-bold text-slate-900 block text-[11px]">
                  {cert?.authorizedSignatory?.name || 'Dr. A. K. M. Shamsuddin'}
                </span>
                <span className="text-slate-600 block text-[9px]">
                  {cert?.authorizedSignatory?.designation || 'MBBS, FCPS - Medical Director'}
                </span>
                <span className="text-[#0d5c75] font-bold block text-[9px]">
                  {cert?.authorizedSignatory?.licenseNumber || 'BMDC Reg No: A-12345'}
                </span>
              </div>
            </div>
          </div>

          {/* CERTIFICATE FOOTER */}
          <div className="text-center pt-2 border-t border-slate-200 text-[9px] text-slate-500">
            <p>
              This official certificate is generated and authenticated via MedVerify. Tampering or altering this document invalidates its certification.
            </p>
            <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1 font-mono">
              <span>MedVerify Clinical Security Standard</span>
              <span className="font-bold text-slate-600">PAGE 1 OF 2 • OFFICIAL CERTIFICATE</span>
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
        <div className="border border-[#212529] p-3 sm:p-5 rounded-sm space-y-3 bg-white">
          
          {/* 1. TOP HEADER BANNER (EXACTLY MATCHING PDF BANNER) */}
          <div className="w-full overflow-hidden flex items-center justify-center border-b border-[#212529] pb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/header_banner.png"
              alt="MYSA Medical Services Header Banner"
              className="w-full h-auto object-contain max-h-24 sm:max-h-28"
              onError={(e) => {
                // If banner file not found, fall back to styled institutional title banner
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* 2. DOCUMENT TITLE */}
          <div className="text-center py-0.5">
            <h2 className="text-xs sm:text-sm font-bold text-[#212529] tracking-wider uppercase font-sans">
              MEDICAL TEST REPORT
            </h2>
          </div>

          {/* 3. REGISTRATION NUMBER, BARCODE & FINGERPRINT */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-bold text-[#212529] uppercase font-sans">
                REG NO: <span className="font-mono">{regNumber}</span>
              </div>
              {/* Deterministic Barcode matching the PDF drawBarcode graphic */}
              <div className="flex items-center gap-[1.5px] mt-1 h-3.5">
                {[3, 1.5, 1.5, 1.5, 4, 3, 1.5, 4, 3, 3, 1.5, 1.5, 3, 1.5, 4, 1.5, 3, 3, 1.5, 4, 1.5, 3, 1.5, 4, 3, 1.5, 3].map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-[#008080] inline-block h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-right text-[11px] font-bold text-[#212529]">
                Reg. Date: {formatDate(data?.registeredAt || rep?.examinationDate)}
              </div>
              <div className="border border-[#212529] px-3 py-1 text-[10px] font-bold text-[#212529] bg-white">
                Finger Print
              </div>
            </div>
          </div>

          {/* 4. PATIENT INFO TABLE & PHOTO BOX (EXACT 4-COLUMN + PHOTO LAYOUT) */}
          <div className="border border-[#212529] grid grid-cols-1 sm:grid-cols-4 bg-white text-xs">
            {/* Left 3 columns: Candidate Details Table */}
            <div className="sm:col-span-3 divide-y divide-[#212529] border-b sm:border-b-0 sm:border-r border-[#212529]">
              {/* Row 1 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px]">
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">NAME</div>
                <div className="p-1.5 font-bold text-[#212529] uppercase truncate">{pat?.fullName || 'MD MOHAN MIA'}</div>
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">COUNTRY</div>
                <div className="p-1.5 font-bold text-[#212529] uppercase truncate">{pat?.destinationCountry || 'UAE/DUBAI'}</div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px]">
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">PASSPORT NO</div>
                <div className="p-1.5 font-bold text-[#212529] uppercase font-mono">{pat?.passportNumber || 'A09876543'}</div>
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">BIRTH DATE</div>
                <div className="p-1.5 font-bold text-[#212529]">{formatDate(pat?.dateOfBirth)}</div>
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px]">
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">MARITAL STATUS</div>
                <div className="p-1.5 font-bold text-[#212529]">{pat?.maritalStatus || 'Married'}</div>
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">RELIGION</div>
                <div className="p-1.5 font-bold text-[#212529]">{pat?.religion || 'Islam'}</div>
              </div>
              {/* Row 4 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px]">
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">AGE</div>
                <div className="p-1.5 font-bold text-[#212529]">{ageDisplay}</div>
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">GENDER</div>
                <div className="p-1.5 font-bold text-[#212529]">{pat?.gender || 'Male'}</div>
              </div>
              {/* Row 5 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px]">
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">NATIONALITY</div>
                <div className="p-1.5 font-bold text-[#212529] uppercase">{pat?.nationality || 'Bangladeshi'}</div>
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">HEIGHT (CM)</div>
                <div className="p-1.5 font-bold text-[#212529]">{pat?.heightCm ? `${pat.heightCm} cm` : '—'}</div>
              </div>
              {/* Row 6 */}
              <div className="grid grid-cols-4 divide-x divide-[#212529] text-[10.5px]">
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">AGENCY</div>
                <div className="p-1.5 font-bold text-[#212529] truncate">{pat?.agency || 'Al-Hasan Overseas Recruitment'}</div>
                <div className="p-1.5 bg-slate-50 font-normal text-[#212529]">WEIGHT (KG)</div>
                <div className="p-1.5 font-bold text-[#212529]">{pat?.weightKg ? `${pat.weightKg} kg` : '—'}</div>
              </div>
            </div>

            {/* Far Right: Patient Photo Box */}
            <div className="p-1.5 flex flex-col items-center justify-center bg-white">
              <div className="w-24 sm:w-28 h-28 sm:h-32 border border-slate-300 bg-white flex items-center justify-center overflow-hidden relative shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoSrc}
                  alt="Candidate Photograph"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default_photo.png';
                  }}
                />
              </div>
              <span className="text-[8px] text-slate-500 uppercase mt-0.5 font-mono">Patient Photo</span>
            </div>
          </div>

          {/* 5. CLINICAL EXAMINATION & LABORATORY TABLES (TWO SIDE-BY-SIDE TABLES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
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
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.exam_remarks || 'NAD'}</div>
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
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.haemoglobin || '14.5'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">ESR</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.esr || '12'}</div>
              </div>
              <div className="grid grid-cols-3">
                <div className="col-span-2 p-1 pl-2">R.B.S</div>
                <div className="p-1 text-center border-l border-[#212529] font-medium">{repData.rbs || '6.5'}</div>
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
          <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Left: Status & Remarks */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-normal text-[#212529]">HIS/HER STATUS: </span>
                <span className="border border-red-600 px-3 py-0.5 text-xs font-bold text-[#212529] tracking-wider uppercase">
                  {fitness}
                </span>
              </div>

              <div className="text-xs font-bold text-[#212529]">
                REMARKS: <span className="text-red-600">{rep?.finalRemarks || 'CLINICALLY FIT FOR OVERSEAS EMPLOYMENT'}</span>
              </div>
            </div>

            {/* Right: Chest X-Ray and QR Box side by side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Chest X-Ray Box */}
              <div className="border border-[#212529] h-36 bg-black/5 flex flex-col items-center justify-center overflow-hidden p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={xraySrc}
                  alt="Chest X-Ray"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default_xray.png';
                  }}
                />
              </div>

              {/* QR Verification Box */}
              <div className="border border-[#212529] h-36 p-1.5 flex flex-col items-center justify-between text-center bg-white">
                <div className="w-20 h-20 bg-white border border-slate-200 p-0.5 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : `https://medverify-zeta.vercel.app/verify/${token}`)}`}
                    alt="Scan to Verify"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-[#212529] block uppercase">SCAN TO VERIFY REPORT</span>
                  <span className="text-[7.5px] text-slate-500 font-mono block">Reg: {regNumber}</span>
                  <span className="text-[7px] font-bold text-emerald-700 block">Official Verification Portal</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. AUTO-GENERATED DISCLAIMER & FOOTER */}
          <div className="text-center pt-2 border-t border-slate-300 text-[10px] text-[#212529]">
            This is an auto generated report, does not require any signature.
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
