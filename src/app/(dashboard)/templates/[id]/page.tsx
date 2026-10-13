'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react';

export default function TemplateDetailPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await api.get<any>(`/templates/${id}`);
        setTemplate(res);
        if (res.versions && res.versions.length > 0) {
          const active = res.versions.find((v: any) => v.id === res.activeVersionId) || res.versions[0];
          setSelectedVersion(active);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTemplate();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading template schema...</div>;
  }

  if (!template) {
    return <div className="p-8 text-center text-xs text-rose-500">Template not found.</div>;
  }

  const schema = selectedVersion?.schema;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Link href="/templates">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {template.name}
            </h1>
            <Badge variant="fit">Version #{selectedVersion?.versionNumber}</Badge>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Protocol Code: {template.code} • {template.description}
          </p>
        </div>
      </div>

      {/* Version Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          <span>Versions:</span>
        </span>
        {template.versions?.map((v: any) => (
          <button
            key={v.id}
            onClick={() => setSelectedVersion(v)}
            className={`px-2.5 py-1 text-xs rounded font-mono ${
              selectedVersion?.id === v.id
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            v{v.versionNumber} {v.id === template.activeVersionId && '(Active)'}
          </button>
        ))}
      </div>

      {/* Sections and Fields Inspector */}
      <div className="space-y-3">
        {schema?.sections?.map((sec: any) => (
          <Card key={sec.id} className="bg-white">
            <CardHeader className="py-2.5 bg-slate-50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs uppercase font-bold text-slate-800">
                  {sec.title}
                </CardTitle>
                <span className="text-[10px] text-slate-400 font-mono">Category: {sec.category} • Layout: {sec.column}</span>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {sec.fields?.length || 0} fields
              </Badge>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {sec.fields?.map((f: any) => (
                  <div key={f.id} className="p-2 rounded border border-slate-100 bg-slate-50/50 space-y-0.5">
                    <span className="font-semibold text-slate-800 block text-[11px] truncate">{f.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Key: {f.key} | Type: {f.type}
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
