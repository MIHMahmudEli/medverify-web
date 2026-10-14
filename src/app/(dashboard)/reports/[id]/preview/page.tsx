'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PreviewDocMode = 'COMBINED' | 'CERTIFICATE_ONLY' | 'REPORT_ONLY';

export default function ReportPdfPreviewPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [docMode, setDocMode] = useState<PreviewDocMode>('COMBINED');
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadDocument = async (mode: PreviewDocMode, repData?: any, certData?: any) => {
    setLoading(true);
    setError(null);
    try {
      const ts = Date.now();
      let endpoint = `/reports/${id}/print-pdf?t=${ts}`;
      if (mode === 'CERTIFICATE_ONLY') {
        const cId = certData?.id || certificate?.id;
        endpoint = cId ? `/certificates/${cId}/pdf?t=${ts}` : `/reports/${id}/print-pdf?t=${ts}`;
      } else if (mode === 'REPORT_ONLY') {
        endpoint = `/reports/${id}/pdf?t=${ts}`;
      }

      const blob = await api.downloadBlob(endpoint);
      const url = window.URL.createObjectURL(blob);

      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(url);
    } catch (err: any) {
      console.error('Failed to load PDF for mode:', mode, err);
      try {
        const blob = await api.downloadBlob(`/reports/${id}/pdf`);
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e: any) {
        setError(e.message || 'Failed to render PDF preview');
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
          // No certificate yet
        }

        await loadDocument('COMBINED', rep, cert);
      } catch (err: any) {
        setError(err.message || 'Failed to load document preview');
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

  const handleModeChange = (mode: PreviewDocMode) => {
    setDocMode(mode);
    loadDocument(mode);
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch {
        // Fallback
      }
    }
    if (pdfUrl) {
      const win = window.open(pdfUrl, '_blank');
      win?.focus();
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    const modeName =
      docMode === 'COMBINED'
        ? 'Combined_Certificate_and_Report'
        : docMode === 'CERTIFICATE_ONLY'
          ? 'Certificate'
          : 'Report';
    a.download = `MedVerify_${modeName}_${report?.registrationNumber || id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Header */}
      <PageHeader
        title="Document Preview & Print Console"
        description={`Authoritative high-resolution PDF for candidate: ${report?.patient?.fullName || 'Candidate'} (${report?.registrationNumber || ''})`}
        backHref={`/reports/${id}`}
        backLabel="Back to report details"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || !pdfUrl}
              onClick={handlePrint}
              className="gap-1.5 rounded-lg border-slate-200 text-slate-800 hover:border-slate-300"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Document</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              disabled={loading || !pdfUrl}
              onClick={handleDownload}
              className="gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xs font-semibold"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Button>

            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-lg text-slate-600 hover:text-slate-900"
                  title="Open in new window"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </Button>
              </a>
            )}
          </div>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={() => loadDocument(docMode)} />
      ) : (
        <>
          {/* Document Mode Selection Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => handleModeChange('COMBINED')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5',
                  docMode === 'COMBINED'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Layers className="h-3.5 w-3.5 text-teal-400" />
                <span>Combined 2-Page Document (Recommended)</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('CERTIFICATE_ONLY')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5',
                  docMode === 'CERTIFICATE_ONLY'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <FileCheck2 className="h-3.5 w-3.5 text-blue-500" />
                <span>Page 1: Certificate Only</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('REPORT_ONLY')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5',
                  docMode === 'REPORT_ONLY'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <FileText className="h-3.5 w-3.5 text-amber-500" />
                <span>Page 2: Medical Report Only</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono text-center sm:text-right">
              A4 Portrait • High DPI Vector
            </span>
          </div>

          {/* Interactive Document Viewer Frame */}
          <Card className="bg-slate-900/5 border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden p-2 sm:p-4">
            <div className="bg-white rounded-xl border border-slate-300 shadow-float overflow-hidden relative min-h-[500px] sm:min-h-[750px]">
              {loading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 animate-fadeInFast">
                  <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                  <p className="text-xs font-semibold text-slate-700">
                    Generating High-Fidelity Clinical PDF...
                  </p>
                </div>
              )}

              {pdfUrl ? (
                <iframe
                  ref={iframeRef}
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  title="PDF Preview"
                  className="w-full h-[550px] sm:h-[800px] border-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 h-[500px]">
                  <FileText className="h-10 w-10 mb-2" />
                  <p className="text-xs font-semibold">No preview generated</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
