'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { History, Shield, ShieldCheck, Lock, Activity } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>('/audit-logs', { limit: 50 });
      setLogs(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load security audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes('FINALIZE') || action.includes('ISSUE')) {
      return <Badge variant="fit" className="font-mono text-[9px]">{action}</Badge>;
    }
    if (action.includes('REVOKE') || action.includes('DELETE')) {
      return <Badge variant="unfit" className="font-mono text-[9px]">{action}</Badge>;
    }
    if (action.includes('AMEND') || action.includes('UPDATE')) {
      return <Badge variant="pending" className="font-mono text-[9px]">{action}</Badge>;
    }
    return <Badge variant="secondary" className="font-mono text-[9px]">{action}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Security & Clinical Audit Logs"
        description="Immutable regulatory audit trail logging doctor finalizations, certificate issuances, amendments, revocations, and authentication events."
        badge={
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Lock className="h-3 w-3 text-teal-600" />
            Append-Only Ledger
          </span>
        }
      />

      {/* Main Content Area */}
      {error ? (
        <ErrorState message={error} onRetry={loadLogs} />
      ) : loading ? (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden p-4">
          <TableSkeleton rows={8} cols={5} />
        </Card>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Audit trail active"
          description="System events, logins, and clinical sign-offs are logged in real-time."
        />
      ) : (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 border-slate-200 hover:bg-slate-50/70">
                    <TableHead className="text-xs font-semibold text-slate-700 pl-6">
                      Timestamp
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Security Action
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Authorized User
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Entity Reference
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-700 pr-6">
                      IP Address
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-slate-50/80 border-slate-100 transition-colors"
                    >
                      <TableCell className="pl-6 font-mono text-xs text-slate-600">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-semibold text-xs text-slate-900">
                        {log.user?.fullName || log.userId || 'SYSTEM'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {log.entityType ? `${log.entityType} (#${String(log.entityId).substring(0, 8)})` : '—'}
                      </TableCell>
                      <TableCell className="text-right pr-6 font-mono text-xs text-slate-500">
                        {log.ipAddress || '127.0.0.1'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
