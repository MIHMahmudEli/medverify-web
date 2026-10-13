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
} from 'lucide-react';

const defaultApi = process.env.NODE_ENV === 'production'
  ? 'https://medverify-api-y6am.onrender.com'
  : 'http://localhost:4000';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || defaultApi).replace(/\/+$/, '');

interface VerificationResult {
  verified: boolean;
  status: 'VALID' | 'REVOKED' | 'SUPERSEDED' | 'INVALID' | 'DRAFT';
  message?: string;
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
}

export default function PublicVerificationPage() {
  const { token } = useParams();
  const [data, setData] = useState<VerificationResult | null>(null);
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
          message: 'Unable to communicate with verification servers.',
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

  return (
    <div className="min-h-screen bg-slate-100/90 py-12 px-4 flex flex-col items-center justify-center print:bg-white print:p-0">
      <div className="w-full max-w-lg space-y-4 animate-fadeIn">
        {/* Header branding */}
        <div className="flex flex-col items-center text-center space-y-1.5 print:hidden">
          <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-card">
            <Stethoscope className="h-6 w-6 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            MedVerify Digital Verification
          </h1>
          <p className="text-xs text-slate-500">
            Official Pre-Employment Examination Authentication Portal
          </p>
        </div>

        {/* Verification Certificate Card */}
        <Card className="bg-white border-slate-200/90 shadow-card print:border-none print:shadow-none rounded-xl overflow-hidden">
          {/* Top Status Header Banner */}
          {loading ? (
            <div className="p-6">
              <CertificateSkeleton />
            </div>
          ) : (
            <>
              {data?.status === 'VALID' ? (
                <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/30 flex items-center justify-center ring-2 ring-emerald-400/50">
                      <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-emerald-900 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold tracking-wider uppercase">
                        Officially Verified Certificate
                      </h2>
                    </div>
                    <p className="text-[11px] text-emerald-100/90 mt-0.5">
                      Cryptographic authentication confirmed against the MedVerify central clinical registry.
                    </p>
                  </div>
                </div>
              ) : data?.status === 'DRAFT' ? (
                <div className="p-5 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="h-10 w-10 rounded-full bg-amber-500/30 flex items-center justify-center ring-2 ring-amber-400/50 flex-shrink-0">
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
                  <div className="h-10 w-10 rounded-full bg-rose-500/30 flex items-center justify-center ring-2 ring-rose-400/50 flex-shrink-0">
                    <XCircle className="h-6 w-6 text-rose-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase">
                      Certificate Formally Revoked
                    </h2>
                    <p className="text-[11px] text-rose-100/90 mt-0.5">
                      This medical report was invalidated by the issuing clinic and is strictly not valid.
                    </p>
                  </div>
                </div>
              ) : data?.status === 'SUPERSEDED' ? (
                <div className="p-5 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="h-10 w-10 rounded-full bg-amber-500/30 flex items-center justify-center ring-2 ring-amber-400/50 flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase">
                      Certificate Superseded
                    </h2>
                    <p className="text-[11px] text-amber-100/90 mt-0.5">
                      A newer amendment was issued. Scan the QR code on the updated report.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gradient-to-r from-slate-800 via-slate-850 to-slate-900 text-white flex items-center gap-3.5 shadow-inner">
                  <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center ring-2 ring-slate-600 flex-shrink-0">
                    <XCircle className="h-6 w-6 text-slate-300" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-wider uppercase">
                      Invalid Verification Token
                    </h2>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      No genuine medical certificate matches this verification signature.
                    </p>
                  </div>
                </div>
              )}

              {/* Details Body */}
              {data && (
                <CardContent className="p-5 space-y-4">
                  {(data.status === 'VALID' || data.status === 'DRAFT') && (
                    <>
                      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50/90 border border-slate-200/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                            Registration Number
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {data.registrationNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                            Certified Fitness
                          </span>
                          <Badge
                            variant={data.status === 'DRAFT' ? 'draft' : data.finalMedicalStatus === 'FIT' ? 'fit' : 'unfit'}
                            className="mt-0.5"
                          >
                            {data.status === 'DRAFT' ? 'DRAFT (PENDING APPROVAL)' : data.finalMedicalStatus}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                            Examination Date
                          </span>
                          <span className="text-slate-800 font-medium">
                            {formatDate(data.registeredAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">
                            Destination
                          </span>
                          <span className="text-slate-800 font-medium">
                            {data.destinationCountry || '—'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Issuing Clinic:</span>
                          <span className="font-semibold text-slate-900">
                            {data.issuingOrganization || 'MYSA Medical Center'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Patient Identifier (Masked):</span>
                          <span className="font-mono font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                            {data.patientInitials}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Recruiting Agency:</span>
                          <span className="text-slate-800 font-medium">
                            {data.agency || '—'}
                          </span>
                        </div>
                        {data.status === 'DRAFT' && (
                          <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1 mt-2">
                            <span className="font-semibold block text-amber-900">Pre-Approval Status:</span>
                            <span className="text-amber-800 block text-[11px] leading-relaxed">
                              This report has been saved as a draft. When an authorized medical doctor finalizes the examination, a permanent cryptographic token will be issued, verifying this report as genuine and certified.
                            </span>
                          </div>
                        )}
                        {data.finalizedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Signed Timestamp:</span>
                            <span className="text-slate-600 font-mono text-[11px]">
                              {new Date(data.finalizedAt).toUTCString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {data.status === 'REVOKED' && (
                    <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs space-y-2">
                      <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-rose-700" />
                        <span>Revocation Reason</span>
                      </div>
                      <p className="text-rose-800 leading-relaxed">
                        {data.revocationReason || 'Certificate formally invalidated by medical authorities.'}
                      </p>
                      {data.revokedAt && (
                        <div className="text-[10px] text-rose-600 pt-1 border-t border-rose-200/60">
                          Revoked on: {formatDate(data.revokedAt)}
                        </div>
                      )}
                    </div>
                  )}

                  {data.status === 'SUPERSEDED' && (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <div className="font-semibold text-amber-900">
                        Amendment Notice
                      </div>
                      <p className="text-amber-800 leading-relaxed">
                        {data.message || 'A newer revision of this examination has been issued.'}
                      </p>
                    </div>
                  )}

                  {data.status === 'INVALID' && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      {data.message || 'Please check that you have scanned an authentic MedVerify QR code.'}
                    </div>
                  )}

                  {/* Privacy Disclosure Notice */}
                  <div className="p-3 rounded-lg bg-slate-50 text-[10px] text-slate-500 flex items-start gap-2 border border-slate-100">
                    <Lock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                    <span className="leading-relaxed">
                      Privacy Protection Standard: In accordance with clinical data regulations, sensitive laboratory values, passport numbers, and radiological images are never publicly disclosed.
                    </span>
                  </div>
                </CardContent>
              )}

              <CardFooter className="p-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
                <span className="text-[10px] text-slate-400 font-mono">
                  Token: {String(token).substring(0, 12)}...
                </span>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs h-7.5 border-slate-200 hover:bg-slate-100/60">
                  <Printer className="h-3 w-3" />
                  <span>Print Authentication</span>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

