'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck2,
  Globe2,
  Loader2,
  Upload,
  Trash2,
  Image as ImageIcon,
  ArrowLeft,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DynamicHeaderBanner } from '@/components/ui/dynamic-header-banner';
import Link from 'next/link';

interface OrganizationFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function OrganizationForm({ initialData, isEdit = false }: OrganizationFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'CERTIFICATE' | 'DISCLOSURE'>('PROFILE');
  const [formData, setFormData] = useState<any>({
    orgName: initialData?.orgName || '',
    orgCode: initialData?.orgCode || '',
    orgAddress: initialData?.orgAddress || '',
    orgAddressLine2: initialData?.orgAddressLine2 || '',
    orgPhone: initialData?.orgPhone || '',
    orgEmail: initialData?.orgEmail || '',
    logoUrl: initialData?.logoUrl || '',
    reportHeaderTitle: initialData?.reportHeaderTitle || 'MEDICAL TEST REPORT',
    disclaimerText:
      initialData?.disclaimerText || 'This is an auto generated report, does not require any signature.',
    certificateTitle: initialData?.certificateTitle || 'MEDICAL FITNESS CERTIFICATE',
    certificateNumberPrefix: initialData?.certificateNumberPrefix || 'MC',
    signatoryName: initialData?.signatoryName || 'Dr. A. K. M. Shamsuddin',
    signatoryDesignation: initialData?.signatoryDesignation || 'MBBS, FCPS - Medical Director',
    signatoryLicenseNumber: initialData?.signatoryLicenseNumber || 'BMDC Reg No: A-12345',
    signatorySignatureUrl: initialData?.signatorySignatureUrl || '',
    certificateFooter:
      initialData?.certificateFooter ||
      'This official certificate verifies fitness for overseas employment. Authenticate online using the security QR code.',
    certificateValidityDays: initialData?.certificateValidityDays ?? 90,
    isDefault: initialData?.isDefault ?? false,
    isActive: initialData?.isActive ?? true,
    certificateFields: {
      showPassport: true,
      showDob: true,
      showNationality: true,
      showDestination: true,
      showDoctorDetails: true,
      ...(initialData?.certificateFields || {}),
    },
    publicDisclosure: {
      patientNameMode: 'INITIALS',
      showPassport: false,
      showDob: false,
      showNationality: true,
      showDestination: true,
      showDetailedReport: false,
      allowedReportSections: ['physical', 'systemic', 'lab', 'xray'],
      allowPublicDownload: true,
      allowPublicPrint: true,
      ...(initialData?.publicDisclosure || {}),
    },
  });

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
      if (error) setError(null);
    }
  };

  const validateForm = (): {
    errors: Record<string, string>;
    firstError: { id: string; tab: 'PROFILE' | 'CERTIFICATE' | 'DISCLOSURE'; label: string } | null;
  } => {
    const errors: Record<string, string> = {};
    let firstError: { id: string; tab: 'PROFILE' | 'CERTIFICATE' | 'DISCLOSURE'; label: string } | null = null;

    const addErr = (id: string, tab: 'PROFILE' | 'CERTIFICATE' | 'DISCLOSURE', label: string, msg: string) => {
      errors[id] = msg;
      if (!firstError) {
        firstError = { id, tab, label };
      }
    };

    // Tab 1: Profile & Letterhead
    if (!formData.orgName?.trim()) {
      addErr('orgName', 'PROFILE', 'Organization Legal Name', 'Organization / Clinic legal name is required.');
    }

    if (!formData.orgCode?.trim()) {
      addErr('orgCode', 'PROFILE', 'Facility Code / Prefix', 'Facility prefix code is required (e.g. MMS or ISDIC).');
    } else if (!/^[A-Za-z0-9_-]{2,10}$/.test(formData.orgCode.trim())) {
      addErr('orgCode', 'PROFILE', 'Facility Code / Prefix', 'Code prefix must be 2 to 10 letters or numbers.');
    }

    if (!formData.orgAddress?.trim()) {
      addErr('orgAddress', 'PROFILE', 'Address Line 1', 'Diagnostic center address description is required.');
    }

    if (formData.orgEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.orgEmail.trim())) {
      addErr('orgEmail', 'PROFILE', 'Official Support Email', 'Please provide a valid email address.');
    }

    // Tab 2: Certificate & Signatory
    if (!formData.certificateTitle?.trim()) {
      addErr('certificateTitle', 'CERTIFICATE', 'Certificate Header Title', 'Certificate header title is required.');
    }

    if (!formData.certificateNumberPrefix?.trim()) {
      addErr('certificateNumberPrefix', 'CERTIFICATE', 'Certificate Number Prefix', 'Certificate prefix is required (e.g. MC).');
    }

    if (!formData.signatoryName?.trim()) {
      addErr('signatoryName', 'CERTIFICATE', 'Authorized Signatory Doctor', 'Doctor / Signatory physician name is required.');
    }

    if (!formData.signatoryDesignation?.trim()) {
      addErr('signatoryDesignation', 'CERTIFICATE', 'Signatory Medical Designation', 'Signatory medical designation is required.');
    }

    if (!formData.signatoryLicenseNumber?.trim()) {
      addErr('signatoryLicenseNumber', 'CERTIFICATE', 'Doctor Registration / License No', 'Medical registration / BMDC license number is required.');
    }

    return { errors, firstError };
  };

  const tabHasError = (tabId: string) => {
    if (tabId === 'PROFILE') {
      return Boolean(fieldErrors.orgName || fieldErrors.orgCode || fieldErrors.orgAddress || fieldErrors.orgEmail);
    }
    if (tabId === 'CERTIFICATE') {
      return Boolean(
        fieldErrors.certificateTitle ||
        fieldErrors.certificateNumberPrefix ||
        fieldErrors.signatoryName ||
        fieldErrors.signatoryDesignation ||
        fieldErrors.signatoryLicenseNumber
      );
    }
    return false;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const { errors, firstError } = validateForm();
    if (firstError) {
      setFieldErrors(errors);
      setError(`Please complete required field: "${firstError.label}". ${errors[firstError.id]}`);

      // Switch to the tab containing the field if needed
      if (activeTab !== firstError.tab) {
        setActiveTab(firstError.tab);
      }

      // Immediately redirect and focus the missing input field
      setTimeout(() => {
        const el = document.getElementById(`field-${firstError.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 120);

      return;
    }

    setFieldErrors({});
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      if (isEdit && initialData?.id) {
        const updated = await api.patch(`/organizations/${initialData.id}`, formData);
        setFormData(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const created: any = await api.post('/organizations', formData);
        setSaved(true);
        setTimeout(() => {
          router.push(`/organizations`);
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save organization');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError(null);
    try {
      const res = await api.uploadFile(file);
      if (res && res.url) {
        setFormData((prev: any) => ({ ...prev, logoUrl: res.url }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload clinic logo image');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSignature(true);
    setError(null);
    try {
      const res = await api.uploadFile(file);
      if (res && res.url) {
        setFormData((prev: any) => ({ ...prev, signatorySignatureUrl: res.url }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload doctor signature image');
    } finally {
      setUploadingSignature(false);
      e.target.value = '';
    }
  };

  const tabs = [
    { id: 'PROFILE', label: 'Organization Profile', icon: Building2 },
    { id: 'CERTIFICATE', label: 'Official Certificate Configuration', icon: FileCheck2 },
    { id: 'DISCLOSURE', label: 'Public QR Privacy Policy', icon: Globe2 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <PageHeader
        title={isEdit ? `Edit Organization: ${formData.orgName || 'Facility'}` : 'Register New Clinical Organization'}
        description="Configure diagnostic center branding, official certificate parameters, letterheads, and public QR verification disclosures."
        backHref="/organizations"
        backLabel="Back to Organizations"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/organizations">
              <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-slate-200 text-xs">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="h-9 gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs active:scale-95 transition-all text-xs"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{isEdit ? 'Save Changes' : 'Register Organization'}</span>
            </Button>
          </div>
        }
      />

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeInFast shadow-2xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">
            Organization details saved successfully.
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-2.5 animate-fadeInFast shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <span className="font-semibold leading-snug">{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="h-7 px-2.5 text-[11px] border-rose-200 text-rose-800 hover:bg-rose-100 rounded-lg flex-shrink-0"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          const hasError = tabHasError(tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 shadow-2xs active:scale-95 relative',
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900',
                hasError && !isSelected && 'border-rose-300 text-rose-700 bg-rose-50/40',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {hasError && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE & BRANDING */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-6">
          {/* Live Dynamic Letterhead Banner Preview (At Top) */}
          <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
            <CardHeader className="p-4 bg-gradient-to-r from-slate-50 via-teal-50/30 to-sky-50/20 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-teal-600" />
                  Live Dynamic Letterhead Banner Preview
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                  Exact vector emblem, typography layout, and logo rendered on candidate medical PDFs and verification portals.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-800 border-teal-200">Real-Time Preview</Badge>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 bg-slate-100/60 flex flex-col items-center gap-2.5">
              <div className="w-full max-w-4xl bg-white p-3 sm:p-4 rounded-xl shadow-xs border border-slate-200 overflow-x-auto no-scrollbar">
                <DynamicHeaderBanner settings={formData} />
              </div>
              <p className="text-[11px] text-slate-500 text-center sm:text-left w-full max-w-4xl">
                This dynamic banner is generated on-the-fly. Any changes to the facility name, address, contact info, or logo below update immediately in this preview.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-600" />
                <span>Clinical Organization Identification</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Primary legal details used in examination certificates, verification portals, and PDF reports.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Organization / Clinic Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="field-orgName"
                    value={formData.orgName}
                    onChange={(e) => updateField('orgName', e.target.value)}
                    placeholder="e.g. MYSA Medical Center"
                    className={cn(
                      'h-10 text-xs rounded-xl transition-all',
                      fieldErrors.orgName && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.orgName && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.orgName}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Facility Code / Prefix <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="field-orgCode"
                    value={formData.orgCode}
                    onChange={(e) => updateField('orgCode', e.target.value.toUpperCase())}
                    placeholder="e.g. MMS or ISDIC"
                    className={cn(
                      'h-10 text-xs font-mono font-bold uppercase rounded-xl transition-all',
                      fieldErrors.orgCode && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.orgCode ? (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.orgCode}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400">Used as the prefix in candidate registration IDs.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Address Line 1 (Center Description) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="field-orgAddress"
                    value={formData.orgAddress}
                    onChange={(e) => updateField('orgAddress', e.target.value)}
                    placeholder="Diagnostic & Medical Checkup Centre for Overseas Employment"
                    className={cn(
                      'h-10 text-xs rounded-xl transition-all',
                      fieldErrors.orgAddress && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.orgAddress && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.orgAddress}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Address Line 2 (Street / City)
                  </label>
                  <Input
                    id="field-orgAddressLine2"
                    value={formData.orgAddressLine2}
                    onChange={(e) => updateField('orgAddressLine2', e.target.value)}
                    placeholder="e.g. House 42, Road 11, Dhanmondi, Dhaka"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Official Contact Phone
                  </label>
                  <Input
                    id="field-orgPhone"
                    value={formData.orgPhone}
                    onChange={(e) => updateField('orgPhone', e.target.value)}
                    placeholder="+880 1700-000000"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Official Support Email
                  </label>
                  <Input
                    id="field-orgEmail"
                    value={formData.orgEmail}
                    onChange={(e) => updateField('orgEmail', e.target.value)}
                    placeholder="info@mysamedicalbd.com"
                    className={cn(
                      'h-10 text-xs rounded-xl transition-all',
                      fieldErrors.orgEmail && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.orgEmail && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.orgEmail}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Clinic Logo / Emblem (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
                  <div className="h-20 w-20 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo preview" className="h-full w-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {formData.logoUrl ? 'Custom Clinic Logo Active' : 'Default Medical Caduceus Emblem Active'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Uploaded logos appear dynamically on the PDF report header letterhead and verification certificates. PNG, JPG or WebP (max 5MB).
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                        />
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs">
                          {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-teal-600" />}
                          <span>Upload Custom Logo</span>
                        </span>
                      </label>
                      {formData.logoUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, logoUrl: '' })}
                          className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 rounded-lg gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear Logo</span>
                        </Button>
                      )}
                    </div>

                    {/* Direct Logo URL Option */}
                    <div className="pt-2">
                      <Input
                        value={formData.logoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="Or enter direct image URL (https://...)"
                        className="h-8 text-[11px] rounded-lg max-w-md bg-white border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Default & Active Switches */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Default Primary Facility</span>
                    <span className="text-[11px] text-slate-500">
                      Auto-selected for new candidates and reports.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Active Status</span>
                    <span className="text-[11px] text-slate-500">
                      Facility is active and can be chosen when generating reports.
                    </span>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* TAB 2: CERTIFICATE & SIGNATORY */}
      {activeTab === 'CERTIFICATE' && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-teal-600" />
                <span>Official Fitness Certificate Parameters</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Configure certificate title, numbering prefix, authorized physician sign-off credentials, and duration.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Certificate Header Title <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="field-certificateTitle"
                    value={formData.certificateTitle}
                    onChange={(e) => updateField('certificateTitle', e.target.value)}
                    placeholder="MEDICAL FITNESS CERTIFICATE"
                    className={cn(
                      'h-10 text-xs rounded-xl transition-all',
                      fieldErrors.certificateTitle && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.certificateTitle && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.certificateTitle}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Certificate Number Prefix <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="field-certificateNumberPrefix"
                    value={formData.certificateNumberPrefix}
                    onChange={(e) => updateField('certificateNumberPrefix', e.target.value.toUpperCase())}
                    placeholder="MC"
                    className={cn(
                      'h-10 text-xs font-mono font-bold uppercase rounded-xl transition-all',
                      fieldErrors.certificateNumberPrefix && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.certificateNumberPrefix ? (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.certificateNumberPrefix}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400">e.g. MC-2026-00001</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Authorized Signatory Doctor <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="field-signatoryName"
                    value={formData.signatoryName}
                    onChange={(e) => updateField('signatoryName', e.target.value)}
                    placeholder="Dr. A. K. M. Shamsuddin"
                    className={cn(
                      'h-10 text-xs rounded-xl transition-all',
                      fieldErrors.signatoryName && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.signatoryName && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.signatoryName}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Signatory Medical Designation <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="field-signatoryDesignation"
                    value={formData.signatoryDesignation}
                    onChange={(e) => updateField('signatoryDesignation', e.target.value)}
                    placeholder="MBBS, FCPS - Medical Director"
                    className={cn(
                      'h-10 text-xs rounded-xl transition-all',
                      fieldErrors.signatoryDesignation && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.signatoryDesignation && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.signatoryDesignation}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Doctor Registration / License No <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="field-signatoryLicenseNumber"
                    value={formData.signatoryLicenseNumber}
                    onChange={(e) => updateField('signatoryLicenseNumber', e.target.value)}
                    placeholder="BMDC Reg No: A-12345"
                    className={cn(
                      'h-10 text-xs rounded-xl transition-all',
                      fieldErrors.signatoryLicenseNumber && 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20'
                    )}
                  />
                  {fieldErrors.signatoryLicenseNumber && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1 animate-fadeInFast">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span>{fieldErrors.signatoryLicenseNumber}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Signature Upload */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Doctor Official Signature Scan (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
                  <div className="h-16 w-36 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
                    {formData.signatorySignatureUrl ? (
                      <img src={formData.signatorySignatureUrl} alt="Signature preview" className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className="text-[11px] text-slate-300 font-mono italic">No Signature</span>
                    )}
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {formData.signatorySignatureUrl ? 'Custom Doctor Signature Active' : 'Default Stored Signature Active'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={handleSignatureUpload}
                          disabled={uploadingSignature}
                        />
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs">
                          {uploadingSignature ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 text-teal-600" />}
                          <span>Upload Signature Image</span>
                        </span>
                      </label>
                      {formData.signatorySignatureUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, signatorySignatureUrl: '' })}
                          className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 rounded-lg gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear Signature</span>
                        </Button>
                      )}
                    </div>

                    {/* Direct Signature URL Option */}
                    <div className="pt-2">
                      <Input
                        value={formData.signatorySignatureUrl || ''}
                        onChange={(e) => setFormData({ ...formData, signatorySignatureUrl: e.target.value })}
                        placeholder="Or enter direct signature image URL (https://...)"
                        className="h-8 text-[11px] rounded-lg max-w-md bg-white border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Certificate Footer Legal Disclaimer
                  </label>
                  <Input
                    value={formData.certificateFooter}
                    onChange={(e) => setFormData({ ...formData, certificateFooter: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Certificate Validity (Days)
                  </label>
                  <Input
                    type="number"
                    value={formData.certificateValidityDays}
                    onChange={(e) => setFormData({ ...formData, certificateValidityDays: parseInt(e.target.value, 10) || 90 })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: PUBLIC QR PRIVACY POLICY */}
      {activeTab === 'DISCLOSURE' && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-teal-600" />
                <span>Public Verification Privacy & Data Disclosure</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Determine what candidate details are visible when third-party port authorities or employers scan the cryptographic QR code.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Public Candidate Name Mode
                </label>
                <select
                  value={formData.publicDisclosure?.patientNameMode || 'INITIALS'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publicDisclosure: {
                        ...formData.publicDisclosure,
                        patientNameMode: e.target.value,
                      },
                    })
                  }
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="INITIALS">Masked / Initials (e.g. M. S. for MD SAMIM) - HIPAA Recommended</option>
                  <option value="FULL">Full Legal Name (Unmasked)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publicDisclosure?.showPassport}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicDisclosure: {
                          ...formData.publicDisclosure,
                          showPassport: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Show Passport Number on Public Verification</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publicDisclosure?.showDob}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicDisclosure: {
                          ...formData.publicDisclosure,
                          showDob: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Show Date of Birth on Public Verification</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publicDisclosure?.allowPublicDownload}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicDisclosure: {
                          ...formData.publicDisclosure,
                          allowPublicDownload: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Allow Public Two-Page PDF Download</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publicDisclosure?.allowPublicPrint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicDisclosure: {
                          ...formData.publicDisclosure,
                          allowPublicPrint: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Allow Direct Print from QR Portal</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <Link href="/organizations">
          <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-slate-200 text-xs">
            Back to Directory
          </Button>
        </Link>
        <Button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="h-9 px-5 gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs active:scale-95 transition-all text-xs"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>{isEdit ? 'Save Changes' : 'Register Organization'}</span>
        </Button>
      </div>
    </div>
  );
}
