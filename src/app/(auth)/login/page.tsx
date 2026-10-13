'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  CheckCircle2,
  Building,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md space-y-5 animate-fadeIn">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex items-center justify-center text-white shadow-float border border-slate-700/50">
            <Stethoscope className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                MedVerify
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200">
                HEALTHCARE SaaS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Medical Examination, Laboratory Reporting & Verification System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200/90 shadow-card bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">
                Staff Authentication
              </CardTitle>
              <span className="text-[10px] text-teal-700 bg-teal-50 border border-teal-200 font-mono font-medium px-2 py-0.5 rounded-full">
                Encrypted
              </span>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Sign in with your authorized credentials to access your clinical workspace.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeInFast"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email-input"
                  className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block"
                >
                  Clinical Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="email-input"
                    type="email"
                    required
                    placeholder="physician@medverify.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="pl-9 h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password-input"
                    className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pl-9 pr-9 h-10 text-xs bg-white border-slate-200 focus-visible:ring-slate-900 rounded-xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs mt-2 rounded-xl shadow-subtle hover:shadow-card transition-all active:scale-[0.98]"
              >
                {loading ? 'Authenticating Clinical Session...' : 'Sign In to Portal'}
              </Button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2 font-mono">
                Quick Role Autofill (Test Accounts)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDemoCredentials('admin')}
                  className="px-2.5 py-2 text-[11px] border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-left font-medium transition-all group"
                >
                  <span className="font-semibold block text-slate-900 group-hover:text-teal-700">
                    Super Admin
                  </span>
                  <span className="text-[10px] text-slate-400">Full clinical governance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials('doctor')}
                  className="px-2.5 py-2 text-[11px] border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-left font-medium transition-all group"
                >
                  <span className="font-semibold block text-slate-900 group-hover:text-teal-700">
                    Doctor (Reviewer)
                  </span>
                  <span className="text-[10px] text-slate-400">Finalization & sign-off</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials('operator')}
                  className="px-2.5 py-2 text-[11px] border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-left font-medium transition-all group"
                >
                  <span className="font-semibold block text-slate-900 group-hover:text-teal-700">
                    Report Operator
                  </span>
                  <span className="text-[10px] text-slate-400">Patient & data entry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDemoCredentials('lab')}
                  className="px-2.5 py-2 text-[11px] border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-left font-medium transition-all group"
                >
                  <span className="font-semibold block text-slate-900 group-hover:text-teal-700">
                    Lab Technician
                  </span>
                  <span className="text-[10px] text-slate-400">Diagnostic investigation</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-center text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            256-bit Encrypted
          </span>
          <span>•</span>
          <span>Role-Based Access</span>
          <span>•</span>
          <span>Audit-Logged</span>
        </div>
      </div>
    </div>
  );
}
