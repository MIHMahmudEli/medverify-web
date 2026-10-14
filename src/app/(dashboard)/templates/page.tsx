'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { FileSpreadsheet, Eye, Plus, CheckCircle2, Layers } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any[]>('/templates');
      setTemplates(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load report templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Report Templates & Clinical Protocols"
        description="Standardized examination structures, clinical ranges, required panels, and schema version control."
        badge={
          <span className="px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {templates.length} protocol schemas
          </span>
        }
      />

      {/* Main Content Area */}
      {error ? (
        <ErrorState message={error} onRetry={loadTemplates} />
      ) : loading ? (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden p-4">
          <TableSkeleton rows={4} cols={5} />
        </Card>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No clinical templates registered"
          description="Default diagnostic schema active in system configuration."
        />
      ) : (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 border-slate-200 hover:bg-slate-50/70">
                    <TableHead className="text-xs font-semibold text-slate-700 pl-6">
                      Template Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Protocol Code
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Active Version
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Created Date
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-700 pr-6">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((tpl) => (
                    <TableRow
                      key={tpl.id}
                      className="hover:bg-slate-50/80 border-slate-100 transition-colors"
                    >
                      <TableCell className="pl-6 font-semibold text-xs text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200/60">
                            <Layers className="h-4 w-4" />
                          </div>
                          <span>{tpl.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600 uppercase font-semibold">
                        {tpl.code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="fit" className="text-[10px]">
                          v{tpl.activeVersion?.versionNumber || 1} ACTIVE
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(tpl.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Link href={`/templates/${tpl.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-[11px] gap-1 rounded-lg"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Schema</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Responsive Cards View (APK Native Style) */}
            <div className="md:hidden p-3 space-y-3">
              {templates.map((tpl) => (
                <Link
                  key={tpl.id}
                  href={`/templates/${tpl.id}`}
                  className="block p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 active:scale-[0.98] transition-all hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">
                          {tpl.name}
                        </span>
                        <span className="font-mono text-xs text-slate-500 font-semibold uppercase">
                          {tpl.code}
                        </span>
                      </div>
                    </div>
                    <Badge variant="fit" className="text-[9px]">
                      v{tpl.activeVersion?.versionNumber || 1}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>Created: {formatDate(tpl.createdAt)}</span>
                    <span className="text-teal-700 font-semibold text-xs flex items-center gap-1">
                      View Schema
                      <Eye className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
