'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Save, Upload, Camera, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [photoUrl, setPhotoUrl] = useState<string>(initialData?.photoUrl || '');
  const [photoPreview, setPhotoPreview] = useState<string>(initialData?.photoUrl || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadingPhoto(true);

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);

    try {
      const res = await api.uploadFile(file);
      setPhotoUrl(res.url);
      setPhotoPreview(res.url);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        photoUrl: photoUrl || undefined,
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
            {/* Patient Photo Upload Section */}
            <div className="p-3.5 rounded border border-slate-200 bg-slate-50/70 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                Patient Photograph
              </span>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Photo Preview Container */}
                <div className="relative w-24 h-28 rounded border border-slate-300 bg-white overflow-hidden flex items-center justify-center shadow-xs flex-shrink-0">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getFullImageUrl(photoPreview)}
                      alt="Patient preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-8 h-8 mx-auto mb-1 stroke-[1.5]" />
                      <span className="text-[9px] uppercase font-medium">No Photo</span>
                    </div>
                  )}

                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Upload Action & Guidance */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="patient-photo-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5 text-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>{photoPreview ? 'Change Photo' : 'Upload Patient Photo'}</span>
                    </Button>

                    {photoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploadingPhoto}
                        onClick={handleRemovePhoto}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </Button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Standard medical passport portrait. Accepts JPG, PNG, WebP up to 10MB. This image appears on the official medical test certificate.
                  </p>

                  {uploadError && (
                    <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" />
                      {uploadError}
                    </p>
                  )}

                  {photoUrl && !uploadingPhoto && !uploadError && (
                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" />
                      Photo attached to patient record
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                  className="font-mono uppercase"
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
                  placeholder="e.g. Islam, Christianity, Hinduism"
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
                  placeholder="e.g. 165"
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
            disabled={loading || uploadingPhoto}
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
