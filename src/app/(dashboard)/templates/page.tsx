'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { FileSpreadsheet, Eye, Plus, CheckCircle2 } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await api.get<any[]>('/templates');
        setTemplates(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Report Templates & Clinical Protocols
          </h1>
          <p className="text-xs text-slate-500">
            Configure examination sections, laboratory ranges, field requirements, and template versioning.
          </p>
        </div>
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">No templates found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Versions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-semibold text-slate-900">
                      {tpl.name}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700">
                      {tpl.code}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600">
                      {tpl.versions?.length || 1} versions
                    </TableCell>
                    <TableCell>
                      {tpl.isActive ? (
                        <Badge variant="fit" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>ACTIVE</span>
                        </Badge>
                      ) : (
                        <Badge variant="draft">INACTIVE</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(tpl.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/templates/${tpl.id}`}>
                        <Button variant="outline" size="sm" className="h-6.5 px-2 text-[11px] gap-1">
                          <Eye className="h-3 w-3" />
                          <span>View Schema</span>
                        </Button>
                      </Link>
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
