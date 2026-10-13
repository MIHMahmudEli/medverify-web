'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';

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
      } catch (err) {
        console.error(err);
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
    try {
      const updated = await api.patch('/settings', settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  const missingMandatory = !settings.orgName || !settings.certificateTitle;

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Organization & Certificate Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure clinical center branding, official fitness certificate parameters, and public verification privacy disclosure policy.
        </p>
      </div>

      {missingMandatory && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Configuration Incomplete:</strong> Medical Center Legal Name and Certificate Title are required before certificates can be officially issued.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'PROFILE'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Center Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CERTIFICATE')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'CERTIFICATE'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Official Certificate & Signatory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DISCLOSURE')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'DISCLOSURE'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Privacy & Public Disclosure</span>
        </button>
      </div>

      <Card className="bg-white">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-5 space-y-4">
            {saved && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>Organization settings updated successfully.</span>
              </div>
            )}
            {error && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: CENTER PROFILE */}
            {activeTab === 'PROFILE' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      Medical Center Legal Name *
                    </label>
                    <Input
                      required
                      value={settings.orgName || ''}
                      onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      Center Registration Code (Prefix) *
                    </label>
                    <Input
                      required
                      value={settings.orgCode || ''}
                      onChange={(e) => setSettings({ ...settings, orgCode: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">
                    Center Address & Diagnostic Accreditation Subtitle
                  </label>
                  <Input
                    value={settings.orgAddress || ''}
                    onChange={(e) => setSettings({ ...settings, orgAddress: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      Official Contact Phone
                    </label>
                    <Input
                      value={settings.orgPhone || ''}
                      onChange={(e) => setSettings({ ...settings, orgPhone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      Official Clinical Email
                    </label>
                    <Input
                      value={settings.orgEmail || ''}
                      onChange={(e) => setSettings({ ...settings, orgEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">
                    Detailed Report Header Title
                  </label>
                  <Input
                    value={settings.reportHeaderTitle || ''}
                    onChange={(e) => setSettings({ ...settings, reportHeaderTitle: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: OFFICIAL CERTIFICATE & SIGNATORY */}
            {activeTab === 'CERTIFICATE' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      Official Certificate Document Title *
                    </label>
                    <Input
                      required
                      value={settings.certificateTitle || ''}
                      onChange={(e) => setSettings({ ...settings, certificateTitle: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      Certificate Number Prefix
                    </label>
                    <Input
                      value={settings.certificateNumberPrefix || ''}
                      onChange={(e) => setSettings({ ...settings, certificateNumberPrefix: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Authorized Medical Examiner / Signatory
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 uppercase">
                        Doctor Full Name
                      </label>
                      <Input
                        value={settings.signatoryName || ''}
                        onChange={(e) => setSettings({ ...settings, signatoryName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 uppercase">
                        Professional Designation & Degree
                      </label>
                      <Input
                        value={settings.signatoryDesignation || ''}
                        onChange={(e) => setSettings({ ...settings, signatoryDesignation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 uppercase">
                        Medical License / Council Registration No
                      </label>
                      <Input
                        value={settings.signatoryLicenseNumber || ''}
                        onChange={(e) => setSettings({ ...settings, signatoryLicenseNumber: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 uppercase">
                        Certificate Validity (Days)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={settings.certificateValidityDays !== null ? settings.certificateValidityDays : ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            certificateValidityDays: e.target.value === '' ? null : parseInt(e.target.value, 10),
                          })
                        }
                        placeholder="Leave blank for unlimited validity"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">
                    Official Certificate Security Footer & Notice
                  </label>
                  <Input
                    value={settings.certificateFooter || ''}
                    onChange={(e) => setSettings({ ...settings, certificateFooter: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: PRIVACY & PUBLIC DISCLOSURE POLICY */}
            {activeTab === 'DISCLOSURE' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-relaxed">
                  <strong>Controlled Public Disclosure:</strong> Regulates what candidate and medical examination details are visible when public users scan the QR code or visit the online verification portal.
                </div>

                <div className="space-y-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase block">
                      Candidate Name Disclosure Mode
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
                      className="w-full text-xs h-8 rounded border border-slate-300 bg-white px-2.5 font-medium"
                    >
                      <option value="INITIALS">Masked Initials Only (e.g. M*** M***) — Recommended Privacy Standard</option>
                      <option value="FULL">Full Candidate Name (e.g. MD MOHAN MIA)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
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
                      <span className="text-slate-800">Show Masked Passport Number</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
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
                      <span className="text-slate-800">Show Date of Birth</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
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
                      <span className="text-slate-800">Show Candidate Nationality</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
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
                      <span className="text-slate-800">Show Destination Country</span>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!settings.publicDisclosure?.showDetailedReport}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            publicDisclosure: {
                              ...settings.publicDisclosure,
                              showDetailedReport: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span className="text-slate-900 font-semibold">
                        Permit Public Disclosure of Detailed Clinical & Laboratory Findings
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                      When disabled (default), public scans only verify official fitness and examination summary with message: <em>Detailed medical report access is restricted.</em>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
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
                      <span className="text-slate-800">Allow Public PDF Downloads on Verify Portal</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
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
                      <span className="text-slate-800">Allow Public Printing on Verify Portal</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="py-3 px-5 border-t border-slate-100 flex justify-end bg-slate-50/50">
            <Button type="submit" size="sm" className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white">
              <Save className="h-3.5 w-3.5" />
              <span>Save All Settings</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
