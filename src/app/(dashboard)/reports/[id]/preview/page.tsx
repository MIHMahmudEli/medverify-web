'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileDown, ExternalLink } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ReportPdfPreviewPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadPdf() {
      try {
        const rep = await api.get<any>(`/reports/${id}`);
        setReport(rep);

        const blob = await api.downloadBlob(`/reports/${id}/pdf`);
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPdf();
    }

    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [id]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `MedVerify_${report?.registrationNumber || id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href={`/reports/${id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 font-mono">
              PDF Preview: {report?.registrationNumber || 'Loading...'}
            </h1>
            <p className="text-xs text-slate-500">
              High-fidelity server-rendered clinical examination certificate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in New Tab</span>
              </Button>
            </a>
          )}
          <Button
            variant="default"
            size="sm"
            disabled={!pdfUrl}
            onClick={handleDownload}
            className="gap-1.5"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span>Download Official PDF</span>
          </Button>
        </div>
      </div>

      <Card className="bg-white p-2">
        {loading ? (
          <div className="h-[750px] flex items-center justify-center text-xs text-slate-400">
            Rendering high-resolution clinical PDF...
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[750px] rounded border border-slate-200"
            title="Medical Report PDF Preview"
          />
        ) : (
          <div className="h-[750px] flex items-center justify-center text-xs text-rose-500">
            Failed to render PDF document.
          </div>
        )}
      </Card>
    </div>
  );
}
