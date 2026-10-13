'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface PatientFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  description: string;
}

export function PatientForm({
  initialData,
  onSubmit,
  title,
  description,
}: PatientFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    passportNumber: initialData?.passportNumber || '',
    dateOfBirth: initialData?.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
    gender: initialData?.gender || 'Male',
    nationality: initialData?.nationality || 'Bangladeshi',
    country: initialData?.country || 'UAE/DUBAI',
    maritalStatus: initialData?.maritalStatus || 'Unmarried',
    religion: initialData?.religion || 'Islam',
    heightCm: initialData?.heightCm ? String(initialData.heightCm) : '',
    weightKg: initialData?.weightKg ? String(initialData.weightKg) : '',
    agency: initialData?.agency || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
      };
      await onSubmit(payload);
    } catch (err: any) {
      setError(err.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Patients</span>
          </Button>
        </Link>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form id="patient-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Primary Identification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <Input
                  name="fullName"
                  required
                  placeholder="e.g. MD MOHAN"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Passport Number *
                </label>
                <Input
                  name="passportNumber"
                  required
                  placeholder="e.g. A00678003"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Gender *
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:border-slate-800 focus-visible:ring-1 focus-visible:ring-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Nationality *
                </label>
                <Input
                  name="nationality"
                  required
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Destination & Agency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Destination Country *
                </label>
                <Input
                  name="country"
                  required
                  placeholder="e.g. UAE/DUBAI, Saudi Arabia"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="flex h-8 w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 focus-visible:outline-none focus-visible:border-slate-800 focus-visible:ring-1 focus-visible:ring-slate-800"
                >
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Religion
                </label>
                <Input
                  name="religion"
                  placeholder="e.g. Islam, Hinduism"
                  value={formData.religion}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Physical Measurements & Agency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Height (CM)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  name="heightCm"
                  placeholder="e.g. 172"
                  value={formData.heightCm}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Weight (KG)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  name="weightKg"
                  placeholder="e.g. 54"
                  value={formData.weightKg}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Recruiting Agency
                </label>
                <Input
                  name="agency"
                  placeholder="e.g. MYSA MD SIR"
                  value={formData.agency}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Contact Phone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+880 1712-345678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between py-3">
          <Link href="/patients">
            <Button variant="outline" type="button" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            form="patient-form"
            disabled={loading}
            size="sm"
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{loading ? 'Saving...' : 'Save Patient Record'}</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
