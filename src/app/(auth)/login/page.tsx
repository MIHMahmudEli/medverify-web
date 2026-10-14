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
  CheckCircle2,
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
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-800/40 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md z-10 space-y-6 animate-fadeIn">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
            <div className="relative h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center text-teal-400 shadow-2xl border border-slate-800">
              <Stethoscope className="h-7 w-7" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Med<span className="text-teal-400">Verify</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-teal-500/10 text-teal-300 border border-teal-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Clinical Medical Examination & Verification Architecture
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative backdrop-blur-xl bg-slate-950/85 border border-slate-800/80 shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-7">
          {/* Top subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 opacity-90" />

          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Staff Authentication</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sign in with authorized clinical credentials
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2.5 py-1 rounded-full font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              Secure TLS
            </span>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeInFast"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email-input"
                className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block"
              >
                Clinical Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-400 transition-colors pointer-events-none" />
                <Input
                  id="email-input"
                  type="email"
                  required
                  placeholder="physician@medverify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="pl-10 h-11 text-xs bg-slate-900/90 text-white placeholder:text-slate-500 border-slate-800 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password-input"
                  className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-400 transition-colors pointer-events-none" />
                <Input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11 text-xs bg-slate-900/90 text-white placeholder:text-slate-500 border-slate-800 focus-visible:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500/20 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wide rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Clinical Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Role Autofill (Test Accounts) */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-teal-400" />
                Quick Role Autofill
              </span>
              <span className="text-[9px] text-slate-500 font-mono">1-Click Test Access</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Super Admin */}
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedRole === 'admin'
                    ? 'bg-teal-950/40 border-teal-500/60 ring-1 ring-teal-500/40 text-teal-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-white">Super Admin</span>
                </div>
                <span className="text-[10px] text-slate-400 block line-clamp-1">Full governance</span>
              </button>

              {/* Doctor */}
              <button
                type="button"
                onClick={() => setDemoCredentials('doctor')}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedRole === 'doctor'
                    ? 'bg-teal-950/40 border-teal-500/60 ring-1 ring-teal-500/40 text-teal-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-white">Doctor / Reviewer</span>
                </div>
                <span className="text-[10px] text-slate-400 block line-clamp-1">Sign-off & Finalize</span>
              </button>

              {/* Report Operator */}
              <button
                type="button"
                onClick={() => setDemoCredentials('operator')}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedRole === 'operator'
                    ? 'bg-teal-950/40 border-teal-500/60 ring-1 ring-teal-500/40 text-teal-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">Report Operator</span>
                </div>
                <span className="text-[10px] text-slate-400 block line-clamp-1">Data & entry flow</span>
              </button>

              {/* Lab Technician */}
              <button
                type="button"
                onClick={() => setDemoCredentials('lab')}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedRole === 'lab'
                    ? 'bg-teal-950/40 border-teal-500/60 ring-1 ring-teal-500/40 text-teal-200 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Activity className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Lab Technician</span>
                </div>
                <span className="text-[10px] text-slate-400 block line-clamp-1">Diagnostics & labs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Compliance Badges */}
        <div className="flex items-center justify-center gap-3 text-center text-[10px] text-slate-400 font-mono">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
            256-Bit SSL
          </span>
          <span className="text-slate-600">•</span>
          <span>Role RBAC</span>
          <span className="text-slate-600">•</span>
          <span>Audit Trail</span>
        </div>
      </div>
    </div>
  );
}
