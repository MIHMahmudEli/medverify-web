'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDateTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { History, Shield } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.get<any>('/audit-logs', { limit: 50 });
        setLogs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Security & Clinical Audit Logs
        </h1>
        <p className="text-xs text-slate-500">
          Immutable audit trail recording logins, finalizations, amendments, and revocations.
        </p>
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading audit history...</div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center space-y-1">
              <Shield className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">Audit trail active</p>
              <p className="text-[11px] text-slate-400">
                System events and security actions will be recorded here in real-time.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity Reference</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {formatDateTime(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-800 font-medium">
                      {log.entityType}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600 text-xs">
                      {log.entityId || '—'}
                    </TableCell>
                    <TableCell className="font-mono text-slate-500 text-xs">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
