'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  FileDown,
  Printer,
  ExternalLink,
  ShieldCheck,
  FileCheck2,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';

const defaultApi =
  process.env.NODE_ENV === 'production'
    ? 'https://medverify-api-y6am.onrender.com'
    : 'http://localhost:4000';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || defaultApi).replace(/\/+$/, '');

type PreviewDocMode = 'COMBINED' | 'CERTIFICATE_ONLY' | 'REPORT_ONLY';

export default function ReportPdfPreviewPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [docMode, setDocMode] = useState<PreviewDocMode>('COMBINED');
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadDocument = async (mode: PreviewDocMode, repData?: any, certData?: any) => {
    setLoading(true);
    try {
      let endpoint = `/reports/${id}/print-pdf`;
      if (mode === 'CERTIFICATE_ONLY') {
        const cId = certData?.id || certificate?.id;
        endpoint = cId ? `/certificates/${cId}/pdf` : `/reports/${id}/print-pdf`;
      } else if (mode === 'REPORT_ONLY') {
        endpoint = `/reports/${id}/pdf`;
      }

      const blob = await api.downloadBlob(endpoint);
      const url = window.URL.createObjectURL(blob);

      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(url);
    } catch (err) {
      console.error('Failed to load PDF for mode:', mode, err);
      // Fallback to report pdf if combined fails
      try {
        const blob = await api.downloadBlob(`/reports/${id}/pdf`);
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e) {
        console.error('Fallback failed:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const rep = await api.get<any>(`/reports/${id}`);
        setReport(rep);

        let cert = null;
        try {
          cert = await api.get<any>(`/reports/${id}/certificate`);
          setCertificate(cert);
        } catch {
          // No certificate yet (e.g. Draft)
        }

        await loadDocument('COMBINED', rep, cert);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      init();
    }

    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  const handleModeChange = async (newMode: PreviewDocMode) => {
    setDocMode(newMode);
    await loadDocument(newMode);
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } else if (pdfUrl) {
      const win = window.open(pdfUrl, '_blank');
      if (win) {
        win.focus();
        win.print();
      }
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    const suffix =
      docMode === 'COMBINED'
        ? 'Official_Certificate_and_Report'
        : docMode === 'CERTIFICATE_ONLY'
          ? 'Official_Medical_Certificate'
          : 'Detailed_Medical_Report';
    a.download = `MedVerify_${report?.registrationNumber || id}_${suffix}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeVerificationToken =
    certificate?.verificationToken ||
    report?.verificationTokens?.find((t: any) => !t.isRevoked)?.token ||
    `preview-${report?.registrationNumber}`;

  return (
    <div className="space-y-4 max-w-6xl mx-auto animate-fadeIn">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href={`/reports/${id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-mono">
                {report?.registrationNumber || 'Loading...'}
              </h1>
              {certificate ? (
                <Badge variant="fit" className="text-[10px]">
                  CERTIFICATE ISSUED ({certificate.certificateNumber})
                </Badge>
              ) : report?.status === 'FINALIZED' ? (
                <Badge variant="fit" className="text-[10px]">
                  FINALIZED REPORT
                </Badge>
              ) : (
                <Badge variant="draft" className="text-[10px]">
                  DRAFT PREVIEW
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Mandatory Two-Page Print System • Page 1: Official Certificate • Page 2: Detailed Clinical Report
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeVerificationToken && (
            <Link href={`/verify/${activeVerificationToken}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <ExternalLink className="h-3.5 w-3.5 text-teal-600" />
                <span>Verify Online</span>
              </Button>
            </Link>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={!pdfUrl}
            onClick={handlePrint}
            className="gap-1.5 text-xs h-8 border-slate-300"
          >
            <Printer className="h-3.5 w-3.5 text-slate-700" />
            <span>Print Document</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={!pdfUrl}
            onClick={handleDownload}
            className="gap-1.5 text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* Document View Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5">
          <Button
            variant={docMode === 'COMBINED' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeChange('COMBINED')}
            className={`text-xs h-7.5 gap-1.5 ${docMode === 'COMBINED' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'}`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Combined 2-Page Print (Certificate + Report)</span>
          </Button>

          <Button
            variant={docMode === 'CERTIFICATE_ONLY' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeChange('CERTIFICATE_ONLY')}
            className={`text-xs h-7.5 gap-1.5 ${docMode === 'CERTIFICATE_ONLY' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'}`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Page 1: Official Certificate</span>
          </Button>

          <Button
            variant={docMode === 'REPORT_ONLY' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeChange('REPORT_ONLY')}
            className={`text-xs h-7.5 gap-1.5 ${docMode === 'REPORT_ONLY' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700'}`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Page 2: Detailed Clinical Report</span>
          </Button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium px-2">
          {docMode === 'COMBINED' && 'Mandatory print order: Page 1 = Certificate, Page 2 = Report'}
          {docMode === 'CERTIFICATE_ONLY' && 'Standalone formal medical fitness certificate'}
          {docMode === 'REPORT_ONLY' && 'Comprehensive laboratory and radiological test report'}
        </div>
      </div>

      {/* PDF Document Render Container */}
      <Card className="bg-white p-2 shadow-sm border border-slate-200">
        {loading ? (
          <div className="h-[780px] flex flex-col items-center justify-center space-y-2 text-xs text-slate-400">
            <div className="h-7 w-7 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
            <span>Compiling and rendering high-resolution PDF...</span>
          </div>
        ) : pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-[780px] rounded border border-slate-200"
            title="Official Medical Document Preview"
          />
        ) : (
          <div className="h-[780px] flex items-center justify-center text-xs text-rose-500">
            Failed to render PDF document. Please verify network connection or regenerate the document.
          </div>
        )}
      </Card>
    </div>
  );
}
