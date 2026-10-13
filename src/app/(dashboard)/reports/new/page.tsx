'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportForm } from '@/components/reports/report-form';

export default function NewReportPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || undefined;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Prepare Medical Examination Report
        </h1>
        <p className="text-xs text-slate-500">
          Fill in systemic physical examination and laboratory findings.
        </p>
      </div>

      <ReportForm preselectedPatientId={patientId} />
    </div>
  );
}
