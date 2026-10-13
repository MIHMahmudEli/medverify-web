'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    orgName: 'MYSA Medical Center',
    orgCode: 'MMS',
    orgAddress: 'Diagnostic & Medical Checkup Centre for Overseas Employment',
    orgPhone: '+880 1700-000000',
    orgEmail: 'info@mysamedicalbd.com',
    reportHeaderTitle: 'MEDICAL TEST REPORT',
    disclaimerText: 'This is an auto generated report, does not require any signature.',
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get<any>('/settings');
        if (res) setSettings(res);
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

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Organization & Center Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure diagnostic center branding, registration prefixes, and report disclaimers.
        </p>
      </div>

      <Card className="bg-white">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Medical Center Profile</CardTitle>
            <CardDescription>
              These details appear on official PDF certificates and online verification lookups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {saved && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Settings saved successfully.</span>
              </div>
            )}
            {error && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">
                  Center / Clinic Name *
                </label>
                <Input
                  required
                  value={settings.orgName}
                  onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">
                  Center Registration Code (Prefix) *
                </label>
                <Input
                  required
                  value={settings.orgCode}
                  onChange={(e) => setSettings({ ...settings, orgCode: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 uppercase">
                Official Address / Subtitle
              </label>
              <Input
                value={settings.orgAddress}
                onChange={(e) => setSettings({ ...settings, orgAddress: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">
                  Contact Phone
                </label>
                <Input
                  value={settings.orgPhone}
                  onChange={(e) => setSettings({ ...settings, orgPhone: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">
                  Official Email
                </label>
                <Input
                  value={settings.orgEmail}
                  onChange={(e) => setSettings({ ...settings, orgEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-semibold text-slate-700 uppercase">
                PDF Certificate Header Title
              </label>
              <Input
                value={settings.reportHeaderTitle}
                onChange={(e) => setSettings({ ...settings, reportHeaderTitle: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 uppercase">
                Legal Disclaimer / Footer Notice
              </label>
              <Input
                value={settings.disclaimerText}
                onChange={(e) => setSettings({ ...settings, disclaimerText: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="py-3 flex justify-end">
            <Button type="submit" size="sm" className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              <span>Save Settings</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
