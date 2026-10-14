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
import { cn } from '@/lib/utils';

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
  const errorAlertRef = useRef<HTMLDivElement>(null);
  const photoCardRef = useRef<HTMLDivElement>(null);

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [photoUrl, setPhotoUrl] = useState<string>(initialData?.photoUrl || '');
  const [photoPreview, setPhotoPreview] = useState<string>(initialData?.photoUrl || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error as user corrects it
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const scrollToField = (fieldName: string) => {
    setTimeout(() => {
      const el = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try {
          el.focus({ preventScroll: true });
        } catch {
          el.focus();
        }
      } else {
        scrollToTopError();
      }
    }, 60);
  };

  const scrollToTopError = () => {
    setTimeout(() => {
      if (errorAlertRef.current) {
        errorAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
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
      const errMsg = err.message || 'Failed to upload photo';
      setUploadError(errMsg);
      setTimeout(() => {
        photoCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
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

  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errs.fullName = 'Full legal candidate name is required';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Candidate name must be at least 2 characters';
    }

    if (!formData.passportNumber.trim()) {
      errs.passportNumber = 'Passport number is required';
    } else if (formData.passportNumber.trim().length < 4) {
      errs.passportNumber = 'Valid passport number is required (min 4 characters)';
    }

    if (!formData.dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (isNaN(dob.getTime()) || dob > today) {
        errs.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    if (!formData.gender) {
      errs.gender = 'Gender selection is required';
    }

    if (!formData.nationality.trim()) {
      errs.nationality = 'Candidate nationality is required';
    }

    if (!formData.country.trim()) {
      errs.country = 'Destination country is required';
    }

    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please provide a valid email address';
      }
    }

    if (formData.heightCm) {
      const h = parseFloat(formData.heightCm);
      if (isNaN(h) || h < 30 || h > 250) {
        errs.heightCm = 'Height must be between 30 and 250 cm';
      }
    }

    if (formData.weightKg) {
      const w = parseFloat(formData.weightKg);
      if (isNaN(w) || w < 20 || w > 300) {
        errs.weightKg = 'Weight must be between 20 and 300 kg';
      }
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Client-Side Field Validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError('Please complete or correct the highlighted fields before proceeding.');
      const firstInvalidKey = Object.keys(validationErrors)[0];
      scrollToField(firstInvalidKey);
      return;
    }

    setFieldErrors({});
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
      const msg = err.message || 'Failed to save patient record';
      setError(msg);
      setLoading(false);

      // Check if backend error corresponds to a specific field
      const lower = msg.toLowerCase();
      let matchedField = '';
      if (lower.includes('passport')) {
        matchedField = 'passportNumber';
        setFieldErrors((prev) => ({ ...prev, passportNumber: msg }));
      } else if (lower.includes('fullname') || lower.includes('full name')) {
        matchedField = 'fullName';
        setFieldErrors((prev) => ({ ...prev, fullName: msg }));
      } else if (lower.includes('date of birth') || lower.includes('dateofbirth')) {
        matchedField = 'dateOfBirth';
        setFieldErrors((prev) => ({ ...prev, dateOfBirth: msg }));
      } else if (lower.includes('email')) {
        matchedField = 'email';
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      }

      if (matchedField) {
        scrollToField(matchedField);
      } else {
        scrollToTopError();
      }
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
          ref={errorAlertRef}
          role="alert"
          tabIndex={-1}
          className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs flex items-start gap-3 animate-fadeInFast shadow-xs outline-none"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="font-bold block text-rose-900">Please Review the Form</span>
            <span className="leading-relaxed block">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Candidate Photograph Section */}
        <Card ref={photoCardRef} className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
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
                  <p className="text-[11px] text-rose-600 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{uploadError}</span>
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
              {/* Full Legal Name */}
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
                  className={cn(
                    'h-10 text-xs uppercase bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all',
                    fieldErrors.fullName && 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Passport Number */}
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
                  className={cn(
                    'h-10 text-xs font-mono uppercase bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all',
                    fieldErrors.passportNumber && 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                />
                {fieldErrors.passportNumber && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.passportNumber}</span>
                  </p>
                )}
              </div>

              {/* Date of Birth */}
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
                  className={cn(
                    'h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all',
                    fieldErrors.dateOfBirth && 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                />
                {fieldErrors.dateOfBirth && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.dateOfBirth}</span>
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={cn(
                    'w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all',
                    fieldErrors.gender && 'border-rose-500 focus:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.gender && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.gender}</span>
                  </p>
                )}
              </div>

              {/* Nationality */}
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
                  className={cn(
                    'h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all',
                    fieldErrors.nationality && 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                />
                {fieldErrors.nationality && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.nationality}</span>
                  </p>
                )}
              </div>

              {/* Destination Country */}
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
                  className={cn(
                    'h-10 text-xs uppercase bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all',
                    fieldErrors.country && 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                />
                {fieldErrors.country && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.country}</span>
                  </p>
                )}
              </div>

              {/* Marital Status */}
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

              {/* Religion */}
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

              {/* Height */}
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
                  className={cn(
                    'h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all',
                    fieldErrors.heightCm && 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                />
                {fieldErrors.heightCm && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.heightCm}</span>
                  </p>
                )}
              </div>

              {/* Weight */}
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
                  className={cn(
                    'h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all',
                    fieldErrors.weightKg && 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                />
                {fieldErrors.weightKg && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.weightKg}</span>
                  </p>
                )}
              </div>

              {/* Recruiting Agency */}
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

              {/* Phone Number */}
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

              {/* Email Address */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Candidate Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="e.g. candidate@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    'h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all',
                    fieldErrors.email && 'border-rose-500 focus-visible:ring-rose-500 bg-rose-50/20 ring-1 ring-rose-500/50'
                  )}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="py-4 px-4 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              {Object.keys(fieldErrors).length > 0 && (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1.5 animate-fadeInFast">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{Object.keys(fieldErrors).length} required field(s) need attention</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
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
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
