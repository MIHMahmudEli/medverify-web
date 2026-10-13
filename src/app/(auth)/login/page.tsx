'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Stethoscope, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: 'admin' | 'doctor' | 'operator' | 'lab') => {
    switch (role) {
      case 'admin':
        setEmail('admin@medverify.com');
        setPassword('AdminPassword123!');
        break;
      case 'doctor':
        setEmail('doctor@medverify.com');
        setPassword('DoctorPassword123!');
        break;
      case 'operator':
        setEmail('operator@medverify.com');
        setPassword('OperatorPassword123!');
        break;
      case 'lab':
        setEmail('lab@medverify.com');
        setPassword('LabPassword123!');
        break;
    }
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header branding */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="h-10 w-10 rounded bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Stethoscope className="h-5 w-5 text-teal-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            MedVerify Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-xs">
            Medical Examination, Laboratory Reporting & Verification System
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Staff Authentication
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Sign in with your clinical credentials to access your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {error && (
              <div className="mb-4 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="name@medverify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-8.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mb-2">
                Quick Role Autofill (Seeded Accounts)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin')}
                  className="px-2 py-1 text-[11px] border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-left font-medium"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('doctor')}
                  className="px-2 py-1 text-[11px] border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-left font-medium"
                >
                  Doctor (Reviewer)
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('operator')}
                  className="px-2 py-1 text-[11px] border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-left font-medium"
                >
                  Report Operator
                </button>
                <button
                  type="button"
                  onClick={() => setDemoCredentials('lab')}
                  className="px-2 py-1 text-[11px] border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-left font-medium"
                >
                  Lab Technician
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          <span>Encrypted Session • Role-Based Clinical Authorization</span>
        </div>
      </div>
    </div>
  );
}
