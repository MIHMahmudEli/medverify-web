'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { ReportForm } from '@/components/reports/report-form';

export default function EditReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.get<any>(`/reports/${id}`);
        setReport(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadReport();
    }
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center text-xs text-slate-400">Loading report...</div>;
  }

  if (!report) {
    return <div className="p-10 text-center text-xs text-rose-500">Report not found</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Edit Report Draft: {report.registrationNumber}
        </h1>
        <p className="text-xs text-slate-500">
          Update examination findings and lab results before doctor finalization.
        </p>
      </div>

      <ReportForm initialReport={report} isEdit={true} />
    </div>
  );
}
