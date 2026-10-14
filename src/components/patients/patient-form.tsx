'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import {
  AlertCircle,
  ArrowLeft,
  Save,
  Upload,
  Camera,
  Trash2,
  Loader2,
  CheckCircle2,
  User,
  Shield,
} from 'lucide-react';
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
    maritalStatus: initialData?.maritalStatus || 'Married',
    religion: initialData?.religion || 'Islam',
    heightCm: initialData?.heightCm ? String(initialData.heightCm) : '175.00',
    weightKg: initialData?.weightKg ? String(initialData.weightKg) : '68.00',
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
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        fullName: formData.fullName.trim().toUpperCase(),
        passportNumber: formData.passportNumber.trim().toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality.trim(),
        country: formData.country.trim(),
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
        agency: formData.agency.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        photoUrl: photoUrl || undefined,
      };

      await onSubmit(payload);
    } catch (err: any) {
      setError(err.message || 'Failed to save patient record');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        backHref={initialData?.id ? `/patients/${initialData.id}` : '/patients'}
        backLabel="Back to patients"
      />

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeInFast shadow-2xs"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Candidate Photograph Section */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardHeader className="py-3.5 px-4 sm:px-6 bg-slate-50/60 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Candidate Photograph
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              High-resolution passport-format photo for official fitness certificate and report.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-28 sm:w-32 h-36 sm:h-40 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 flex flex-col items-center justify-center overflow-hidden relative shadow-2xs flex-shrink-0 group">
                {photoPreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getFullImageUrl(photoPreview)}
                      alt="Candidate Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-xs"
                      title="Remove Photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center text-slate-400">
                    <Camera className="h-8 w-8 mb-1.5 stroke-[1.5]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">
                      Passport Photo
                    </span>
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-teal-400 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Upload Biometric Photograph
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    JPG, PNG, or WEBP up to 5MB. Must be clear, front-facing, and taken against a neutral background.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1.5 text-xs rounded-lg border-slate-200 hover:border-slate-300"
                  >
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>{photoPreview ? 'Change Photo' : 'Select Photo'}</span>
                  </Button>

                  {photoPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demographic & Identity Details */}
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardHeader className="py-3.5 px-4 sm:px-6 bg-slate-50/60 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Candidate Identification & Demographics
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Identity details verified against the candidate passport and official visa application.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  name="fullName"
                  placeholder="e.g. MOHAMMAD FARUK"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="h-10 text-xs uppercase bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Passport Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  name="passportNumber"
                  placeholder="e.g. A01234567"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="h-10 text-xs font-mono uppercase bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Nationality <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  name="nationality"
                  placeholder="Bangladeshi"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Destination Country / Embassy <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  name="country"
                  placeholder="e.g. UAE/DUBAI, SAUDI ARABIA, QATAR"
                  value={formData.country}
                  onChange={handleChange}
                  className="h-10 text-xs uppercase bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Unmarried">Unmarried</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Religion
                </label>
                <Input
                  name="religion"
                  placeholder="Islam, Hinduism, Christianity, etc."
                  value={formData.religion}
                  onChange={handleChange}
                  className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Height (cm)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="heightCm"
                  placeholder="175.00"
                  value={formData.heightCm}
                  onChange={handleChange}
                  className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Weight (kg)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="weightKg"
                  placeholder="68.00"
                  value={formData.weightKg}
                  onChange={handleChange}
                  className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Recruiting Agency
                </label>
                <Input
                  name="agency"
                  placeholder="e.g. Al-Hasan Manpower"
                  value={formData.agency}
                  onChange={handleChange}
                  className="h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+880 1700-000000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-10 text-xs font-mono bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="py-4 px-4 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <Link
              href={initialData?.id ? `/patients/${initialData.id}` : '/patients'}
              className="w-full sm:w-auto"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-9 text-xs rounded-xl"
              >
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="w-full sm:w-auto h-9 text-xs rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs gap-1.5 active:scale-95 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>{initialData ? 'Update Candidate Record' : 'Register Candidate'}</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
