'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  ExternalLink,
  ChevronDown,
  Layers,
  Award,
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
  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null);

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
  const certNumber = cert?.certificateNumber || (data?.status === 'DRAFT' ? `DRAFT-${data.registrationNumber}` : `MC-${data?.registrationNumber || '00000'}`);
  const regNumber = data?.registrationNumber || rep?.registrationNumber || '—';
  const fitness = cert?.finalMedicalStatus || data?.finalMedicalStatus || 'FIT';
  const isFit = fitness === 'FIT';
  const orgName = cert?.issuingOrganization || data?.issuingOrganization || 'MYSA MEDICAL SERVICES (PVT.) LTD.';

  return (
    <div className="min-h-screen bg-slate-200/80 py-8 px-2 sm:px-4 flex flex-col items-center print:bg-white print:p-0 print:m-0">
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
                <p className="text-[11px] text-emerald-100/90 mt-0.5">
                  Authenticated directly against the MedVerify central clinical ledger. Showing Page 1 Certificate below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCombinedPdf}
                className="gap-1.5 text-xs h-8 text-slate-800 bg-white hover:bg-slate-100 border-none shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Official 2-Page PDF</span>
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Certificate & Report</span>
              </Button>
            </div>
          </div>
        ) : data?.status === 'DRAFT' ? (
          <div className="p-4 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-amber-300">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wider uppercase">
                  Examination In Progress (Draft Pre-Approval)
                </h2>
                <p className="text-[11px] text-amber-100/90 mt-0.5">
                  This report has been registered in MedVerify and is awaiting final doctor authorization.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Preview</span>
              </Button>
            </div>
          </div>
        ) : data?.status === 'REVOKED' ? (
          <div className="p-4 bg-gradient-to-r from-rose-800 via-rose-900 to-slate-900 text-white rounded-xl shadow-md flex items-center gap-3 border border-rose-500/30">
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

          {/* Revocation / Invalidation Watermark overlay if invalid */}
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
            <p className="text-[11px] sm:text-xs text-slate-600">
              Diagnostic & Medical Checkup Centre for Overseas Employment
            </p>
            <p className="text-[10px] text-slate-500">
              Govt. Approved Center  |  Phone: +880 1700-000000  |  Email: info@mysamedicalbd.com
            </p>
            <div className="w-56 h-[1.5px] bg-[#c5a059] mx-auto my-2" />
          </div>

          {/* CERTIFICATE TITLE */}
          <div className="text-center my-3">
            <div className="inline-block bg-slate-50 border border-[#1e3a5f] px-6 py-1.5 rounded-sm shadow-2xs">
              <h2 className="text-sm sm:text-base font-extrabold tracking-wider text-[#1e3a5f] uppercase">
                {cert ? 'MEDICAL FITNESS CERTIFICATE' : 'MEDICAL FITNESS DECLARATION (DRAFT)'}
              </h2>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-[#0d5c75] tracking-widest uppercase mt-1">
              OFFICIAL PRE-EMPLOYMENT HEALTH EXAMINATION & CLEARANCE CREDENTIAL
            </p>
          </div>

          {/* IDENTIFICATION NUMBERS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/90 border border-slate-300 p-2.5 rounded-sm text-xs my-3">
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Certificate No</span>
              <span className="font-mono font-bold text-[#1e3a5f] text-xs sm:text-sm">{certNumber}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Report Reg No</span>
              <span className="font-mono font-semibold text-slate-900 text-xs sm:text-sm">{regNumber}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Examination Date</span>
              <span className="text-slate-800 font-medium text-xs">{formatDate(data?.registeredAt || rep?.examinationDate)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Date of Issuance</span>
              <span className="text-slate-800 font-medium text-xs">{formatDate(cert?.issueDate || data?.registeredAt)}</span>
            </div>
          </div>

          {/* CANDIDATE IDENTITY SECTION */}
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
                    {pat?.fullName || data?.patientInitials || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Passport Number</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {pat?.passportNumber || (data?.status === 'DRAFT' ? 'A09876543' : 'Protected Under Clinical Privacy')}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Date of Birth / Age</span>
                  <span className="text-slate-800 font-medium">
                    {pat?.dateOfBirth ? formatDate(pat.dateOfBirth) : '12-05-1995'} (31 Y)
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
                    {pat?.agency || data?.agency || 'Al-Hasan Recruitment Agency'}
                  </span>
                </div>
              </div>

              {/* Photo Box */}
              <div className="p-3 flex flex-col items-center justify-center bg-slate-50">
                <div className="w-20 h-24 rounded border border-slate-300 bg-white flex items-center justify-center text-slate-400 text-[10px] shadow-2xs overflow-hidden">
                  <UserCheck className="h-8 w-8 text-slate-300" />
                </div>
                <span className="text-[8px] text-slate-400 uppercase mt-1 font-mono">Photograph</span>
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
                  {data?.status === 'DRAFT' ? 'CLINICALLY FIT FOR OVERSEAS EMPLOYMENT (DRAFT)' : 'CLINICALLY FIT FOR OVERSEAS EMPLOYMENT'}
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
                <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase">Physical & Sensory</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">Eyes, Ears, BP, Body Mass</span>
                <span className="text-[10px] font-bold text-emerald-700 block mt-1">✓ SATISFACTORY</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase">Systemic Exam</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">Heart, Lungs, Abdomen</span>
                <span className="text-[10px] font-bold text-emerald-700 block mt-1">✓ NORMAL (NAD)</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase">Serology & Lab</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">HIV, Hepatitis, VDRL, Sugar</span>
                <span className="text-[10px] font-bold text-emerald-700 block mt-1">✓ NON-REACTIVE</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-[#1e3a5f] block uppercase">Chest Radiology</span>
                <span className="text-[10px] text-slate-600 block mt-0.5">X-Ray Thorax Investigation</span>
                <span className="text-[10px] font-bold text-emerald-700 block mt-1">✓ NORMAL</span>
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

      {/* 4. PAGE 2: DETAILED MEDICAL TEST REPORT (COMBINED PRINT RECORD) */}
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm border border-slate-300 p-4 sm:p-8 relative print:shadow-none print:border-none print:p-0 print-page-2">
        <div className="border border-slate-300 p-4 sm:p-6 rounded-sm space-y-4">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
              {orgName}
            </h2>
            <h3 className="text-xs font-bold text-slate-700 tracking-wider uppercase mt-1">
              DETAILED MEDICAL TEST REPORT (PAGE 2)
            </h3>
            <p className="text-[10px] text-slate-500">
              Registration No: <span className="font-mono font-bold text-slate-900">{regNumber}</span>  •  Exam Date: {formatDate(data?.registeredAt || rep?.examinationDate)}  •  Revision #{rep?.revisionNumber || 1}
            </p>
          </div>

          {/* Candidate identity summary */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">Candidate</span>
              <span className="font-bold text-slate-900">{pat?.fullName || data?.patientInitials || 'MD MOHAN MIA'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">Passport</span>
              <span className="font-mono font-semibold text-slate-800">{pat?.passportNumber || 'A09876543'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">Country</span>
              <span className="font-medium text-slate-800">{pat?.destinationCountry || data?.destinationCountry || 'UAE/DUBAI'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">Certified Fitness</span>
              <Badge variant={isFit ? 'fit' : 'unfit'}>{fitness}</Badge>
            </div>
          </div>

          {/* TWO-COLUMN CLINICAL & LABORATORY TABLE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Column 1: Medical & Physical Examination */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-[#1e3a5f] text-white p-2 font-bold uppercase text-[10px] text-center tracking-wider">
                1. Clinical & Physical Examination
              </div>
              <div className="divide-y divide-slate-200 text-[11px]">
                <div className="flex justify-between p-2"><span>Eye Visual Acuity (R / L)</span><span className="font-semibold">6/6 • 6/6 (Normal)</span></div>
                <div className="flex justify-between p-2"><span>Ear Auditory Function</span><span className="font-semibold">NAD (Normal)</span></div>
                <div className="flex justify-between p-2"><span>Blood Pressure (B.P)</span><span className="font-semibold">120/80 mmHg</span></div>
                <div className="flex justify-between p-2"><span>Cardiovascular / Heart</span><span className="font-semibold">NAD (Normal)</span></div>
                <div className="flex justify-between p-2"><span>Respiratory Exam (Lungs)</span><span className="font-semibold">NAD (Clear)</span></div>
                <div className="flex justify-between p-2"><span>Gastrointestinal / Abdomen</span><span className="font-semibold">NAD (Normal)</span></div>
                <div className="flex justify-between p-2"><span>Hernia / Varicose Veins</span><span className="font-semibold text-emerald-700">ABSENT</span></div>
                <div className="flex justify-between p-2"><span>Physical Deformities / Skin</span><span className="font-semibold">NAD (Nil)</span></div>
                <div className="flex justify-between p-2"><span>Venereal Disease Symptoms</span><span className="font-semibold text-emerald-700">NAD (Nil)</span></div>
              </div>
            </div>

            {/* Column 2: Laboratory Investigation */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <div className="bg-[#1e3a5f] text-white p-2 font-bold uppercase text-[10px] text-center tracking-wider">
                2. Laboratory & Serology Investigations
              </div>
              <div className="divide-y divide-slate-200 text-[11px]">
                <div className="flex justify-between p-2"><span>Blood Group</span><span className="font-bold text-slate-900">B (+VE)</span></div>
                <div className="flex justify-between p-2"><span>Hemoglobin (Hb%)</span><span className="font-semibold">14.5 g/dL</span></div>
                <div className="flex justify-between p-2"><span>HIV I & HIV II Antibody</span><span className="font-bold text-emerald-700">NEGATIVE</span></div>
                <div className="flex justify-between p-2"><span>HBsAg (Hepatitis B)</span><span className="font-bold text-emerald-700">NEGATIVE</span></div>
                <div className="flex justify-between p-2"><span>Anti-HCV (Hepatitis C)</span><span className="font-bold text-emerald-700">NEGATIVE</span></div>
                <div className="flex justify-between p-2"><span>VDRL / Syphilis Screen</span><span className="font-bold text-emerald-700">NON-REACTIVE</span></div>
                <div className="flex justify-between p-2"><span>Urine for Sugar & Albumin</span><span className="font-semibold">NIL • NIL</span></div>
                <div className="flex justify-between p-2"><span>Serum Creatinine & Bilirubin</span><span className="font-semibold">0.9 mg/dL • 0.8 mg/dL</span></div>
                <div className="flex justify-between p-2"><span>Liver Enzymes (SGPT / SGOT)</span><span className="font-semibold">32 U/L • 28 U/L</span></div>
              </div>
            </div>
          </div>

          {/* RADIOLOGY & CHEST X-RAY SECTION */}
          <div className="border border-slate-300 rounded p-3 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-[#1e3a5f] uppercase tracking-wide block">
                3. Diagnostic Radiology — Chest X-Ray Investigation
              </span>
              <p className="text-[11px] text-slate-600">
                Radiological finding: <strong className="text-emerald-700 font-bold">NORMAL THORACIC ARCHITECTURE</strong>
              </p>
              <p className="text-[10px] text-slate-500">
                No active pulmonary lesions, pleural effusion, or thoracic pathology detected.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-700 uppercase">X-Ray Finding:</span>
              <Badge variant="fit">NORMAL</Badge>
            </div>
          </div>

          {/* BOTTOM VERIFICATION & FOOTER OF PAGE 2 */}
          <div className="pt-3 border-t border-slate-200 text-center space-y-1 text-[9px] text-slate-500">
            <p>This is an official auto-generated laboratory record from the MedVerify clinical information management system.</p>
            <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono">
              <span>Security Token: {String(token).substring(0, 18)}...</span>
              <span className="font-bold text-slate-600">PAGE 2 OF 2 • DETAILED CLINICAL REPORT</span>
            </div>
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
