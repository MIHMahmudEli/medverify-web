'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { OrganizationForm } from '@/components/organizations/organization-form';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditOrganizationPage() {
  const { id } = useParams();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrg = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/organizations/${id}`);
      setOrganization(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrg();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <ErrorState
        title="Organization Not Found"
        message={error || 'Could not find the requested clinical organization.'}
        onRetry={loadOrg}
      />
    );
  }

  return <OrganizationForm initialData={organization} isEdit={true} />;
}
