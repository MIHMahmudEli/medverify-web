'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface VerificationResult {
  verified: boolean;
  status: 'VALID' | 'REVOKED' | 'SUPERSEDED' | 'INVALID';
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
        const res = await fetch(`${API_BASE}/api/v1/public/verify/${token}`);
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
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center justify-center print:bg-white print:p-0">
      <div className="w-full max-w-lg space-y-4">
        {/* Header branding */}
        <div className="flex flex-col items-center text-center space-y-1 print:hidden">
          <div className="h-10 w-10 rounded bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Stethoscope className="h-5 w-5 text-teal-400" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            MedVerify Online Verification Portal
          </h1>
          <p className="text-xs text-slate-500">
            Official Public Certificate Authentication Service
          </p>
        </div>

        {/* Verification Certificate Card */}
        <Card className="bg-white border-slate-200 shadow-sm print:border-none print:shadow-none overflow-hidden">
          {/* Top Status Header Banner */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Verifying cryptographic digital certificate...
            </div>
          ) : data?.status === 'VALID' ? (
            <div className="p-4 bg-emerald-800 text-white flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-200 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-bold tracking-tight uppercase">
                  Officially Verified Medical Report
                </h2>
                <p className="text-[11px] text-emerald-100">
                  This certificate was issued by an accredited medical examination center.
                </p>
              </div>
            </div>
          ) : data?.status === 'REVOKED' ? (
            <div className="p-4 bg-rose-800 text-white flex items-center gap-3">
              <XCircle className="h-7 w-7 text-rose-200 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-bold tracking-tight uppercase">
                  Report Revoked by Issuing Authority
                </h2>
                <p className="text-[11px] text-rose-100">
                  This certificate has been formally invalidated and is no longer valid.
                </p>
              </div>
            </div>
          ) : data?.status === 'SUPERSEDED' ? (
            <div className="p-4 bg-amber-800 text-white flex items-center gap-3">
              <AlertTriangle className="h-7 w-7 text-amber-200 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-bold tracking-tight uppercase">
                  Certificate Superseded
                </h2>
                <p className="text-[11px] text-amber-100">
                  An amendment has been issued for this report. This version is historical.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-800 text-white flex items-center gap-3">
              <XCircle className="h-7 w-7 text-slate-300 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-bold tracking-tight uppercase">
                  Invalid Verification Token
                </h2>
                <p className="text-[11px] text-slate-300">
                  No genuine medical certificate matches this verification code.
                </p>
              </div>
            </div>
          )}

          {/* Details Body */}
          {!loading && data && (
            <CardContent className="p-5 space-y-4">
              {data.status === 'VALID' && (
                <>
                  <div className="grid grid-cols-2 gap-3 p-3 rounded bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Registration Number
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {data.registrationNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Certified Status
                      </span>
                      <Badge variant={data.finalMedicalStatus === 'FIT' ? 'fit' : 'unfit'}>
                        {data.finalMedicalStatus}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Issue Date
                      </span>
                      <span className="text-slate-800 font-medium">
                        {formatDate(data.registeredAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Destination
                      </span>
                      <span className="text-slate-800 font-medium">
                        {data.destinationCountry || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Issuing Authority:</span>
                      <span className="font-medium text-slate-900">
                        {data.issuingOrganization || 'MYSA Medical Center'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Patient Identifier (Masked):</span>
                      <span className="font-mono text-slate-800">
                        {data.patientInitials}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Recruiting Agency:</span>
                      <span className="text-slate-800">
                        {data.agency || '—'}
                      </span>
                    </div>
                    {data.finalizedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Authentication Timestamp:</span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          {new Date(data.finalizedAt).toUTCString()}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {data.status === 'REVOKED' && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs space-y-2">
                  <div className="font-semibold text-rose-900">
                    Reason for Revocation:
                  </div>
                  <p className="text-rose-800">
                    {data.revocationReason || 'Certificate formally invalidated by medical authorities.'}
                  </p>
                  {data.revokedAt && (
                    <div className="text-[10px] text-rose-600 pt-1">
                      Revoked on: {formatDate(data.revokedAt)}
                    </div>
                  )}
                </div>
              )}

              {data.status === 'SUPERSEDED' && (
                <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs space-y-1">
                  <div className="font-semibold text-amber-900">
                    Amendment Notice
                  </div>
                  <p className="text-amber-800">
                    {data.message || 'A newer revision of this examination has been issued.'}
                  </p>
                </div>
              )}

              {data.status === 'INVALID' && (
                <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  {data.message || 'Please check that you have scanned an authentic MedVerify QR code.'}
                </div>
              )}

              {/* Privacy Disclosure Notice */}
              <div className="p-2.5 rounded bg-slate-50 text-[10px] text-slate-500 flex items-start gap-2 border border-slate-100">
                <Lock className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                <span>
                  Privacy Protection Standard: In accordance with clinical data regulations, sensitive laboratory values, passport numbers, and radiological images are never publicly disclosed.
                </span>
              </div>
            </CardContent>
          )}

          <CardFooter className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
            <span className="text-[10px] text-slate-400 font-mono">
              Token: {String(token).substring(0, 12)}...
            </span>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="h-3 w-3" />
              <span>Print Authentication</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
