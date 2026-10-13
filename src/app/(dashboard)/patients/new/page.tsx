'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { PatientForm } from '@/components/patients/patient-form';

export default function NewPatientPage() {
  const router = useRouter();

  const handleCreate = async (data: any) => {
    const created = await api.post<any>('/patients', data);
    router.push(`/patients/${created.id}`);
  };

  return (
    <PatientForm
      title="Register New Patient"
      description="Create a medical record for pre-employment checkup and overseas visa examination."
      onSubmit={handleCreate}
    />
  );
}
