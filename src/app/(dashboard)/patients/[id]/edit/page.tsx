'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { PatientForm } from '@/components/patients/patient-form';

export default function EditPatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      try {
        const res = await api.get<any>(`/patients/${id}`);
        setPatient(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPatient();
    }
  }, [id]);

  const handleUpdate = async (data: any) => {
    await api.patch(`/patients/${id}`, data);
    router.push(`/patients/${id}`);
  };

  if (loading) {
    return <div className="p-10 text-center text-xs text-slate-400">Loading patient...</div>;
  }

  if (!patient) {
    return <div className="p-10 text-center text-xs text-rose-500">Patient not found</div>;
  }

  return (
    <PatientForm
      initialData={patient}
      title={`Edit Patient: ${patient.fullName}`}
      description="Update demographic details and passport records."
      onSubmit={handleUpdate}
    />
  );
}
