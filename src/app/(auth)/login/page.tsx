'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  FileCheck2,
  Activity,
  ArrowRight,
  Sparkles,
  LogIn,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'doctor' | 'operator' | 'lab' | null>(null);

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
    setSelectedRole(role);
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
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-100/80 font-sans selection:bg-teal-600 selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-200/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md z-10 space-y-5 animate-fadeIn">
        {/* Login Card (White Theme) */}
        <div className="relative bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500" />

          {/* Form Header: Center Logo -> MedVerify -> (Line Break) Enterprise */}
          <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-slate-100">
            {/* 1. First the Logo at center */}
            <div className="relative group mb-3">
              <div className="h-14 w-14 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 shadow-sm group-hover:scale-105 transition-transform duration-200">
                <Stethoscope className="h-7 w-7" />
              </div>
            </div>

            {/* 2. Bottom of the logo: MedVerify name */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Med<span className="text-teal-600">Verify</span>
            </h1>

            {/* 3. Bottom of the name (line break): Enterprise */}
            <div className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs">
                Enterprise
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Clinical Medical Examination & Verification Architecture
            </p>
          </div>

          {/* Sub-header / TLS status */}
          <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>Staff Authentication</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sign in with authorized clinical credentials
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              Secure TLS
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeInFast"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-snug font-medium">{error}</span>
            </div>
          )}

          {/* Login Form with Field Icons and Labels */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email-input"
                className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5 text-teal-600" />
                <span>Clinical Email Address</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                <Input
                  id="email-input"
                  type="email"
                  required
                  placeholder="physician@medverify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="pl-10 h-11 text-xs bg-slate-50 hover:bg-slate-50/80 text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:bg-white focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-teal-600" />
                  <span>Password</span>
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                <Input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11 text-xs bg-slate-50 hover:bg-slate-50/80 text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:bg-white focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs tracking-wide rounded-xl shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In to Clinical Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Role Autofill (Test Accounts) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-teal-600" />
                Quick Role Autofill
              </span>
              <span className="text-[9px] text-slate-400 font-mono">1-Click Test Access</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Super Admin */}
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedRole === 'admin'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500/40 text-teal-900 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-900">Super Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 block line-clamp-1">Full governance</span>
              </button>

              {/* Doctor */}
              <button
                type="button"
                onClick={() => setDemoCredentials('doctor')}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedRole === 'doctor'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500/40 text-teal-900 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-xs font-semibold text-slate-900">Doctor / Reviewer</span>
                </div>
                <span className="text-[10px] text-slate-500 block line-clamp-1">Sign-off & Finalize</span>
              </button>

              {/* Report Operator */}
              <button
                type="button"
                onClick={() => setDemoCredentials('operator')}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedRole === 'operator'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500/40 text-teal-900 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="text-xs font-semibold text-slate-900">Report Operator</span>
                </div>
                <span className="text-[10px] text-slate-500 block line-clamp-1">Data & entry flow</span>
              </button>

              {/* Lab Technician */}
              <button
                type="button"
                onClick={() => setDemoCredentials('lab')}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedRole === 'lab'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500/40 text-teal-900 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Activity className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-900">Lab Technician</span>
                </div>
                <span className="text-[10px] text-slate-500 block line-clamp-1">Diagnostics & labs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Compliance Badges */}
        <div className="flex items-center justify-center gap-3 text-center text-[10px] text-slate-400 font-mono">
          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            256-Bit SSL
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-600">Role RBAC</span>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-600">Audit Trail</span>
        </div>
      </div>
    </div>
  );
}
