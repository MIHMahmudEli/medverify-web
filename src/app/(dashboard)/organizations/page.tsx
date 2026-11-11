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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-full" />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrgs.map((org) => {
            const isProcessing = actionLoading === org.id;

            return (
              <Card
                key={org.id}
                className={cn(
                  'relative flex flex-col justify-between border transition-all duration-200 shadow-sm hover:shadow-md',
                  org.isDefault
                    ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/20 via-white to-white ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white'
                )}
              >
                <div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.orgName}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-slate-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {org.orgName}
                            </h3>
                            <Badge
                              variant="outline"
                              className="font-mono text-[11px] font-semibold tracking-wider bg-slate-100 text-slate-700 uppercase"
                            >
                              {org.orgCode}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                            {org.reportHeaderTitle || 'Medical Diagnostic Center'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {org.isDefault && (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shadow-2xs flex items-center gap-1">
                            <Star className="h-3 w-3 fill-white" />
                            Default Primary
                          </Badge>
                        )}
                        <Badge
                          variant={org.isActive !== false ? 'fit' : 'secondary'}
                          className="text-[10px]"
                        >
                          {org.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3.5 text-xs text-slate-600 border-t border-slate-100 pt-3.5">
                    {/* Location & Contact */}
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {org.orgAddress}
                          {org.orgAddressLine2 ? `, ${org.orgAddressLine2}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap pt-0.5">
                        {org.orgPhone && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{org.orgPhone}</span>
                          </div>
                        )}
                        {org.orgEmail && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{org.orgEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Signatory & Certificate Settings */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">Certificate Prefix:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {org.certificateNumberPrefix || 'MC'}-YYYY-XXXXX
                        </span>
                      </div>
                      <div className="flex items-start justify-between text-[11px] pt-1 border-t border-slate-200/60">
                        <span className="text-slate-600 font-medium">Medical Signatory:</span>
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">{org.signatoryName || 'N/A'}</p>
                          <p className="text-[10px] text-slate-600">{org.signatoryDesignation}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Metadata */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                        <span>
                          <strong className="text-slate-900">{org.reportCount || 0}</strong> Reports Linked
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-3 mt-4 gap-2">
                  <div className="flex items-center gap-2">
                    {!org.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                        onClick={() => handleSetDefault(org)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Star className="h-3.5 w-3.5 mr-1" />
                        )}
                        Set as Default
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/organizations/${org.id}`}>
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        <Edit className="h-3.5 w-3.5 mr-1 text-slate-600" />
                        Edit Facility
                      </Button>
                    </Link>

                    {!org.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => {
                          setDeleteError(null);
                          setOrgToDelete(org);
                        }}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
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
