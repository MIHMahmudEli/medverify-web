'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck2,
  ShieldAlert,
  Lock,
  Stethoscope,
  Globe2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'CERTIFICATE' | 'DISCLOSURE'>('PROFILE');
  const [settings, setSettings] = useState<any>({
    orgName: 'MYSA Medical Center',
    orgCode: 'MMS',
    orgAddress: 'Diagnostic & Medical Checkup Centre for Overseas Employment',
    orgPhone: '+880 1700-000000',
    orgEmail: 'info@mysamedicalbd.com',
    reportHeaderTitle: 'MEDICAL TEST REPORT',
    disclaimerText: 'This is an auto generated report, does not require any signature.',
    certificateTitle: 'MEDICAL FITNESS CERTIFICATE',
    certificateNumberPrefix: 'MC',
    signatoryName: 'Dr. A. K. M. Shamsuddin',
    signatoryDesignation: 'MBBS, FCPS - Medical Director',
    signatoryLicenseNumber: 'BMDC Reg No: A-12345',
    signatorySignatureUrl: '',
    certificateFooter: 'This official certificate verifies fitness for overseas employment. Authenticate online using the security QR code.',
    certificateValidityDays: 90,
    certificateFields: {
      showPassport: true,
      showDob: true,
      showNationality: true,
      showDestination: true,
      showDoctorDetails: true,
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
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get<any>('/settings');
        if (res) {
          setSettings((prev: any) => ({
            ...prev,
            ...res,
            certificateFields: {
              ...prev.certificateFields,
              ...(res.certificateFields || {}),
            },
            publicDisclosure: {
              ...prev.publicDisclosure,
              ...(res.publicDisclosure || {}),
            },
          }));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load system settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const updated = await api.patch('/settings', settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'PROFILE', label: 'Organization Profile', icon: Building2 },
    { id: 'CERTIFICATE', label: 'Official Certificate Configuration', icon: FileCheck2 },
    { id: 'DISCLOSURE', label: 'Public QR Privacy Policy', icon: Globe2 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Organization & Governance Settings"
        description="Branding, clinical certificate parameters, authorized signatories, and public verification privacy rules."
        actions={
          <Button
            type="button"
            disabled={saving || loading}
            onClick={handleSubmit}
            className="gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs active:scale-95 transition-all"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save All Settings</span>
          </Button>
        }
      />

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeInFast shadow-2xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">
            System settings saved successfully. All changes applied to clinical reports and verification portal.
          </span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-fadeInFast shadow-2xs">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 shadow-2xs active:scale-95',
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', isSelected ? 'text-white' : 'text-slate-400')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* TAB 1: ORGANIZATION PROFILE */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-5 animate-fadeInFast">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Clinical Center Identification
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official organization details displayed on reports, certificates, and verification screens.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Organization Name *
                    </label>
                    <Input
                      required
                      value={settings.orgName || ''}
                      onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                      placeholder="e.g. MYSA Medical Services (Pvt.) Ltd."
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Organization Prefix Code *
                    </label>
                    <Input
                      required
                      value={settings.orgCode || ''}
                      onChange={(e) => setSettings({ ...settings, orgCode: e.target.value })}
                      placeholder="e.g. MMS"
                      className="h-10 text-xs font-mono uppercase rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Diagnostic Center Address
                    </label>
                    <Input
                      value={settings.orgAddress || ''}
                      onChange={(e) => setSettings({ ...settings, orgAddress: e.target.value })}
                      placeholder="Full facility address"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Support Contact Phone
                    </label>
                    <Input
                      value={settings.orgPhone || ''}
                      onChange={(e) => setSettings({ ...settings, orgPhone: e.target.value })}
                      placeholder="+880 1700-000000"
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Official Contact Email
                    </label>
                    <Input
                      value={settings.orgEmail || ''}
                      onChange={(e) => setSettings({ ...settings, orgEmail: e.target.value })}
                      placeholder="info@mysamedicalbd.com"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Medical Report Title Header
                    </label>
                    <Input
                      value={settings.reportHeaderTitle || ''}
                      onChange={(e) => setSettings({ ...settings, reportHeaderTitle: e.target.value })}
                      placeholder="MEDICAL TEST REPORT"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CERTIFICATE CONFIGURATION */}
            {activeTab === 'CERTIFICATE' && (
              <div className="space-y-5 animate-fadeInFast">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Fitness Certificate Layout & Signatory
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authorized physician designation, BMDC medical license, certificate title, and validity days.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Certificate Title Header
                    </label>
                    <Input
                      value={settings.certificateTitle || ''}
                      onChange={(e) => setSettings({ ...settings, certificateTitle: e.target.value })}
                      placeholder="MEDICAL FITNESS CERTIFICATE"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Certificate Number Prefix
                    </label>
                    <Input
                      value={settings.certificateNumberPrefix || ''}
                      onChange={(e) => setSettings({ ...settings, certificateNumberPrefix: e.target.value })}
                      placeholder="MC"
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Authorized Signatory Name
                    </label>
                    <Input
                      value={settings.signatoryName || ''}
                      onChange={(e) => setSettings({ ...settings, signatoryName: e.target.value })}
                      placeholder="Dr. A. K. M. Shamsuddin"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Signatory Professional Designation
                    </label>
                    <Input
                      value={settings.signatoryDesignation || ''}
                      onChange={(e) => setSettings({ ...settings, signatoryDesignation: e.target.value })}
                      placeholder="MBBS, FCPS - Medical Director"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Medical License Number
                    </label>
                    <Input
                      value={settings.signatoryLicenseNumber || ''}
                      onChange={(e) => setSettings({ ...settings, signatoryLicenseNumber: e.target.value })}
                      placeholder="BMDC Reg No: A-12345"
                      className="h-10 text-xs font-mono rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Certificate Validity Duration (Days)
                    </label>
                    <Input
                      type="number"
                      value={settings.certificateValidityDays || 90}
                      onChange={(e) => setSettings({ ...settings, certificateValidityDays: parseInt(e.target.value) || 90 })}
                      placeholder="90"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Certificate Footer Disclaimer
                    </label>
                    <Input
                      value={settings.certificateFooter || ''}
                      onChange={(e) => setSettings({ ...settings, certificateFooter: e.target.value })}
                      placeholder="This official certificate verifies fitness for overseas employment. Authenticate online using security QR code."
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PUBLIC QR PRIVACY DISCLOSURE */}
            {activeTab === 'DISCLOSURE' && (
              <div className="space-y-5 animate-fadeInFast">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Public Online Verification Privacy Policy
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Control data masking and confidential information displayed when any third-party scans the QR code.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Public Patient Name Presentation Mode
                    </label>
                    <select
                      value={settings.publicDisclosure?.patientNameMode || 'INITIALS'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          publicDisclosure: {
                            ...settings.publicDisclosure,
                            patientNameMode: e.target.value,
                          },
                        })
                      }
                      className="w-full sm:w-80 h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                    >
                      <option value="INITIALS">Masked Initials (e.g. M*** F***) — Recommended</option>
                      <option value="FULL">Full Legal Name (Unmasked)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!settings.publicDisclosure?.showPassport}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            publicDisclosure: {
                              ...settings.publicDisclosure,
                              showPassport: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>Show Masked Passport Number</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!settings.publicDisclosure?.showDob}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            publicDisclosure: {
                              ...settings.publicDisclosure,
                              showDob: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>Show Date of Birth</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.publicDisclosure?.showNationality !== false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            publicDisclosure: {
                              ...settings.publicDisclosure,
                              showNationality: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>Show Candidate Nationality</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.publicDisclosure?.showDestination !== false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            publicDisclosure: {
                              ...settings.publicDisclosure,
                              showDestination: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>Show Destination Country</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.publicDisclosure?.allowPublicDownload !== false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            publicDisclosure: {
                              ...settings.publicDisclosure,
                              allowPublicDownload: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>Allow Public PDF Downloads on Verify Portal</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={settings.publicDisclosure?.allowPublicPrint !== false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            publicDisclosure: {
                              ...settings.publicDisclosure,
                              allowPublicPrint: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>Allow Public Printing on Verify Portal</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="py-4 px-4 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs h-9 px-4 text-xs active:scale-95 transition-all"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>Save All Settings</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
