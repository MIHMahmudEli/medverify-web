'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Building2,
  Plus,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Mail,
  FileText,
  UserCheck,
  Edit,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // For delete modal
  const [orgToDelete, setOrgToDelete] = useState<any | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/organizations');
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load clinical organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleSetDefault = async (org: any) => {
    if (org.isDefault) return;
    setActionLoading(org.id);
    try {
      await api.post(`/organizations/${org.id}/set-default`, {});
      await fetchOrganizations();
    } catch (err: any) {
      alert(err.message || 'Failed to set organization as default');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!orgToDelete) return;
    setDeleteError(null);
    setActionLoading(orgToDelete.id);
    try {
      await api.delete(`/organizations/${orgToDelete.id}`);
      setOrgToDelete(null);
      await fetchOrganizations();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete organization');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const q = search.toLowerCase();
    return (
      org.orgName?.toLowerCase().includes(q) ||
      org.orgCode?.toLowerCase().includes(q) ||
      org.orgEmail?.toLowerCase().includes(q) ||
      org.orgAddress?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Organizations & Facilities"
        description="Register and manage multiple clinical diagnostic centers, custom letterhead branding, signatories, and report numbering prefixes."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Organizations' },
        ]}
        actions={
          <Link href="/organizations/new">
            <Button className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Register Organization
            </Button>
          </Link>
        }
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by center name, code, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
          />
        </div>
        <div className="text-xs text-slate-600 font-medium self-end sm:self-center">
          Total Organizations: <span className="font-semibold text-slate-900">{organizations.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="rounded-2xl border border-slate-200/90 p-4 space-y-3 bg-white shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-full rounded-md" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load organizations"
          message={error}
          onRetry={fetchOrganizations}
        />
      ) : filteredOrgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={search ? 'No matching organizations found' : 'No clinical organizations registered'}
          description={
            search
              ? `No organization matched "${search}". Try clearing your search query.`
              : 'Add your primary or partner clinical centers to issue reports under different branding.'
          }
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            ) : (
              <Link href="/organizations/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Register First Organization
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrgs.map((org) => {
            const isProcessing = actionLoading === org.id;

            return (
              <Card
                key={org.id}
                className={cn(
                  'relative rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-card hover:border-slate-300 flex flex-col justify-between overflow-hidden bg-white group',
                  org.isDefault
                    ? 'border-emerald-300/90 bg-gradient-to-b from-emerald-50/25 via-white to-white ring-1 ring-emerald-500/20'
                    : 'border-slate-200/90'
                )}
              >
                <div>
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="h-11 w-11 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.orgName}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-sm truncate leading-snug group-hover:text-teal-700 transition-colors">
                            {org.orgName}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                              {org.orgCode}
                            </span>
                            {org.isDefault && (
                              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                                <Star className="h-2.5 w-2.5 fill-emerald-600 text-emerald-600" />
                                Default
                              </span>
                            )}
                            <span
                              className={cn(
                                'text-[9.5px] font-semibold px-1.5 py-0.2 rounded-full',
                                org.isActive !== false
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              )}
                            >
                              {org.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-3 space-y-2.5 text-xs text-slate-600">
                    {/* Location */}
                    <p className="text-[11px] text-slate-500 flex items-start gap-1.5 line-clamp-2">
                      <MapPin className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{org.orgAddress || 'Address not configured'}</span>
                    </p>

                    {/* Signatory & Prefix Box */}
                    <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100/90 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[10.5px]">Certificate Prefix:</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {org.certificateNumberPrefix || org.orgCode || 'MC'}-YYYY
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[10.5px]">Signatory:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[150px] text-[11px]">
                          {org.signatoryName || 'Medical Director'}
                        </span>
                      </div>
                    </div>

                    {/* Stats & Reports Count */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-teal-600" />
                        <span>Reports Linked</span>
                      </span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                        {org.reportCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-2.5 px-4 mt-2 gap-2">
                  <div>
                    {!org.isDefault ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2.5 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 rounded-lg gap-1"
                        onClick={() => handleSetDefault(org)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Star className="h-3 w-3 mr-0.5" />
                        )}
                        Set Default
                      </Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Primary Center
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link href={`/organizations/${org.id}`}>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] rounded-lg border-slate-200 gap-1 hover:border-slate-300">
                        <Edit className="h-3 w-3 text-slate-500" />
                        <span>Edit</span>
                      </Button>
                    </Link>

                    {!org.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        onClick={() => {
                          setDeleteError(null);
                          setOrgToDelete(org);
                        }}
                        disabled={isProcessing}
                        title="Delete organization"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!orgToDelete}
        onOpenChange={(open) => !open && setOrgToDelete(null)}
        title={`Delete "${orgToDelete?.orgName}"?`}
        description={
          deleteError
            ? deleteError
            : orgToDelete?.reportCount > 0
            ? `Cannot delete this organization because it is currently linked to ${orgToDelete.reportCount} existing medical report(s). Please reassign or delete those reports first.`
            : `Are you sure you want to permanently delete this organization? This action cannot be undone.`
        }
        variant="danger"
        confirmLabel={orgToDelete?.reportCount > 0 ? 'Close' : 'Delete Organization'}
        loading={actionLoading === orgToDelete?.id}
        onConfirm={
          orgToDelete?.reportCount > 0
            ? () => setOrgToDelete(null)
            : handleDelete
        }
      />
    </div>
  );
}
