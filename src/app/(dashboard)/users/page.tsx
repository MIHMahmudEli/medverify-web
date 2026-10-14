'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ModalPortal } from '@/components/ui/modal-portal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Plus,
  ShieldCheck,
  UserX,
  CheckCircle,
  AlertCircle,
  Users,
  UserPlus,
  Shield,
  Lock,
  Mail,
  User,
  Building2,
  X,
  Sparkles,
  KeyRound,
  Copy,
  CheckCircle2,
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'REPORT_OPERATOR',
    department: 'Clinical Operations',
  });
  const [modalError, setModalError] = useState<string | null>(null);

  // Reset / Temporary Password States
  const [selectedUserForReset, setSelectedUserForReset] = useState<any | null>(null);
  const [customTempPassword, setCustomTempPassword] = useState('');
  const [generatedTempPassword, setGeneratedTempPassword] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetCopied, setResetCopied] = useState(false);

  const handleOpenResetModal = (user: any) => {
    setSelectedUserForReset(user);
    setCustomTempPassword('');
    setGeneratedTempPassword(null);
    setResetError(null);
    setResetCopied(false);
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUserForReset) return;
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await api.post<any>(`/users/${selectedUserForReset.id}/reset-password`, {
        temporaryPassword: customTempPassword.trim() || undefined,
      });
      setGeneratedTempPassword(res.temporaryPassword);
    } catch (err: any) {
      setResetError(err.message || 'Failed to restore temporary password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (!generatedTempPassword) return;
    navigator.clipboard.writeText(generatedTempPassword);
    setResetCopied(true);
    setTimeout(() => setResetCopied(false), 3000);
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>('/users', { limit: 50 });
      setUsers(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setActionLoading(true);
    try {
      await api.post('/users', formData);
      setShowCreateModal(false);
      setFormData({
        email: '',
        fullName: '',
        password: '',
        role: 'REPORT_OPERATOR',
        department: 'Clinical Operations',
      });
      await loadUsers();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      if (user.isActive) {
        await api.delete(`/users/${user.id}`);
      } else {
        await api.patch(`/users/${user.id}`, { isActive: true });
      }
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'SUPER_ADMIN') {
      return <Badge variant="default" className="bg-slate-950 text-white font-mono text-[9px]">SUPER ADMIN</Badge>;
    }
    if (role === 'ADMIN') {
      return <Badge variant="default" className="bg-slate-800 text-white font-mono text-[9px]">ADMIN</Badge>;
    }
    if (role === 'DOCTOR') {
      return <Badge variant="fit" className="font-mono text-[9px]">PHYSICIAN / DOCTOR</Badge>;
    }
    if (role === 'LAB_TECHNICIAN') {
      return <Badge variant="pending" className="font-mono text-[9px]">LAB TECHNICIAN</Badge>;
    }
    return <Badge variant="secondary" className="font-mono text-[9px]">REPORT OPERATOR</Badge>;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="User Directory & Clinical Roles"
        description="Role-based authorization controls, physician signatories, laboratory personnel, and administrative accounts."
        badge={
          <span className="px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {users.length} accounts
          </span>
        }
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-semibold active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create New User</span>
          </Button>
        }
      />

      {/* Main Content Area */}
      {error ? (
        <ErrorState message={error} onRetry={loadUsers} />
      ) : loading ? (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden p-4">
          <TableSkeleton rows={6} cols={6} />
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Register administrative staff and diagnostic personnel."
          action={
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="gap-1.5 text-xs rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create User</span>
            </Button>
          }
        />
      ) : (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 border-slate-200 hover:bg-slate-50/70">
                    <TableHead className="text-xs font-semibold text-slate-700 pl-6">
                      User / Physician
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Email Address
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Clinical Role
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Department
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Created
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-slate-700 pr-6">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow
                      key={u.id}
                      className="hover:bg-slate-50/80 border-slate-100 transition-colors"
                    >
                      <TableCell className="pl-6 font-semibold text-xs text-slate-900">
                        {u.fullName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {u.email}
                      </TableCell>
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {u.department || 'Operations'}
                      </TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Deactivated
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenResetModal(u)}
                            title="Restore Temporary Password"
                            className="h-7 px-2.5 text-[11px] rounded-lg transition-all gap-1 text-slate-700 hover:text-teal-700 hover:bg-teal-50 border-slate-200 shadow-2xs"
                          >
                            <KeyRound className="h-3 w-3 text-teal-600" />
                            <span>Reset Pass</span>
                          </Button>

                          <Button
                            variant={u.isActive ? 'outline' : 'secondary'}
                            size="sm"
                            onClick={() => handleToggleActive(u)}
                            className="h-7 px-2.5 text-[11px] rounded-lg transition-all"
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Responsive Cards View (APK Native Style) */}
            <div className="md:hidden p-3 space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-slate-900 block truncate">
                        {u.fullName}
                      </span>
                      <span className="font-mono text-xs text-slate-500 block truncate mt-0.5">
                        {u.email}
                      </span>
                    </div>
                    {getRoleBadge(u.role)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-700">
                        {u.department || 'Operations'}
                      </span>
                      <span className="text-slate-300">•</span>
                      {u.isActive ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">Active</span>
                      ) : (
                        <span className="text-rose-700 font-semibold text-[11px]">Deactivated</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenResetModal(u)}
                        className="h-7 px-2 text-[11px] rounded-lg gap-1 border-teal-200 bg-teal-50/50 text-teal-700 font-semibold"
                      >
                        <KeyRound className="h-3 w-3" />
                        <span>Reset Pass</span>
                      </Button>

                      <Button
                        variant={u.isActive ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleActive(u)}
                        className="h-7 px-2.5 text-[11px] rounded-lg"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CREATE USER MODAL - Centered in Viewport via ModalPortal with Backdrop Blur */}
      {showCreateModal && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="relative max-w-lg w-full bg-white shadow-2xl rounded-3xl border border-slate-200/90 animate-in zoom-in-95 duration-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />

              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-600 shadow-xs">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Register Clinical Account</span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        RBAC
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assign role-based access, diagnostic authority, and digital signatory rights.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreate}>
                <div className="p-6 space-y-4">
                  {modalError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeInFast">
                      <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  {/* Full Legal Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Full Legal Name *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                      <Input
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Dr. A. K. M. Shamsuddin"
                        className="pl-10 h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Clinical Email Address *
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="doctor@medverify.com"
                        className="pl-10 h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Initial Password *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                      <Input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min 8 characters, 1 uppercase, 1 special symbol"
                        className="pl-10 h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Role & Department Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Clinical Role *
                      </label>
                      <div className="relative">
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full h-10 pl-3 pr-8 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold appearance-none cursor-pointer"
                        >
                          <option value="DOCTOR">Doctor (Signatory Physician)</option>
                          <option value="REPORT_OPERATOR">Report Operator (Data Entry)</option>
                          <option value="LAB_TECHNICIAN">Lab Technician (Diagnostics)</option>
                          <option value="ADMIN">System Administrator</option>
                          <option value="SUPER_ADMIN">Super Administrator</option>
                        </select>
                        <Shield className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Department
                      </label>
                      <div className="relative group">
                        <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
                        <Input
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder="e.g. Diagnostic Center"
                          className="pl-10 h-10 text-xs rounded-xl border-slate-200 focus-visible:ring-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between py-4 px-6 bg-slate-50/80 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    className="h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading}
                    className="h-10 px-5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {actionLoading ? 'Creating User Account...' : 'Register Account'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* RESTORE / TEMPORARY PASSWORD MODAL */}
      {selectedUserForReset && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="max-w-md w-full bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
              <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-slate-50 border-b border-slate-100 pb-4 relative">
                <button
                  type="button"
                  onClick={() => setSelectedUserForReset(null)}
                  className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Restore User Account Password
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-0.5">
                      Issue a temporary password for account recovery.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Target User Details */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {selectedUserForReset.fullName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {selectedUserForReset.email}
                    </span>
                  </div>
                  {getRoleBadge(selectedUserForReset.role)}
                </div>

                {resetError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeInFast">
                    <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium leading-snug">{resetError}</span>
                  </div>
                )}

                {/* If temporary password has been generated */}
                {generatedTempPassword ? (
                  <div className="space-y-3 animate-fadeInFast">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Temporary Password Active</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-snug">
                        Give this temporary password to <strong>{selectedUserForReset.fullName}</strong>. They can log in immediately and then update their password from their account profile.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-sm">
                      <div className="font-mono font-bold text-base sm:text-lg tracking-wider text-teal-300 select-all">
                        {generatedTempPassword}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCopyPassword}
                        className="h-8 px-3 text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg gap-1.5 shadow-xs transition-all active:scale-95 flex-shrink-0"
                      >
                        {resetCopied ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Password</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      If this staff member forgot their password or cannot log in, generate a temporary password below. You can enter a custom password or leave it blank to automatically create a random secure one.
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Custom Temporary Password (Optional)
                      </label>
                      <Input
                        type="text"
                        value={customTempPassword}
                        onChange={(e) => setCustomTempPassword(e.target.value)}
                        placeholder="Leave blank to auto-generate"
                        className="h-10 text-xs font-mono rounded-xl"
                      />
                      <span className="text-[10px] text-slate-400">
                        Leave blank to auto-generate a secure temporary password.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between py-3.5 px-5 bg-slate-50/80 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserForReset(null)}
                  className="h-9 text-xs rounded-xl"
                >
                  {generatedTempPassword ? 'Close' : 'Cancel'}
                </Button>

                {!generatedTempPassword && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={resetLoading}
                    onClick={handleConfirmResetPassword}
                    className="h-9 px-4 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs active:scale-95 transition-all gap-1.5"
                  >
                    {resetLoading ? 'Generating...' : 'Restore Temporary Password'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
