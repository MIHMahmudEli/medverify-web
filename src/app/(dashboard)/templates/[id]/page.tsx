'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/error-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle2, Layers, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TemplateDetailPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>(`/templates/${id}`);
      setTemplate(res);
      if (res.versions && res.versions.length > 0) {
        const active = res.versions.find((v: any) => v.id === res.activeVersionId) || res.versions[0];
        setSelectedVersion(active);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load template schema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  if (error || !template) {
    return (
      <ErrorState
        title="Protocol Schema Not Found"
        message={error || 'No template schema matches this identifier.'}
        onRetry={loadTemplate}
      />
    );
  }

  const schema = selectedVersion?.schema;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title={template.name}
        description={`Protocol Code: ${template.code} • ${template.description || 'Clinical diagnostic schema'}`}
        backHref="/templates"
        backLabel="Back to templates"
        badge={
          <Badge variant="fit" className="text-[10px]">
            v{selectedVersion?.versionNumber || 1} {selectedVersion?.id === template.activeVersionId ? 'ACTIVE' : 'REVISION'}
          </Badge>
        }
      />

      {/* Version Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-3 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1.5 flex-shrink-0">
          <Layers className="h-4 w-4 text-teal-600" />
          <span>Available Versions:</span>
        </span>
        {template.versions?.map((v: any) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setSelectedVersion(v)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-xl font-mono transition-all whitespace-nowrap',
              selectedVersion?.id === v.id
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            v{v.versionNumber} {v.id === template.activeVersionId && '(Active)'}
          </button>
        ))}
      </div>

      {/* Sections and Fields Inspector */}
      <div className="space-y-4">
        {schema?.sections?.map((sec: any) => (
          <Card key={sec.id} className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
            <CardHeader className="py-3 px-4 sm:px-6 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs uppercase font-bold text-slate-800">
                  {sec.title}
                </CardTitle>
                <span className="text-[10px] text-slate-400 font-mono">
                  Category: {sec.category} • Layout: {sec.column}
                </span>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {sec.fields?.length || 0} fields
              </Badge>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {sec.fields?.map((f: any) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1 hover:border-slate-200 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 block text-xs truncate">
                      {f.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Key: <span className="text-slate-700 font-semibold">{f.key}</span> | Type: {f.type}
                    </span>
                    {f.defaultValue && (
                      <span className="text-[10px] text-teal-700 font-mono block">
                        Default: {String(f.defaultValue)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
