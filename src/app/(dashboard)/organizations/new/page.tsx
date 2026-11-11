'use client';

import React from 'react';
import { OrganizationForm } from '@/components/organizations/organization-form';

export default function NewOrganizationPage() {
  return <OrganizationForm isEdit={false} />;
}
