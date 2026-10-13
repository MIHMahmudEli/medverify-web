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
            className="gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-2xs font-semibold"
          >
            <UserPlus className="h-3.5 w-3.5" />
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
              className="gap-1.5 text-xs rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create User</span>
            </Button>
          }
        />
      ) : (
        <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Deactivated
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {formatDate(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant={u.isActive ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleActive(u)}
                          className="h-7 px-2.5 text-[11px] rounded-lg"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeInFast">
          <Card className="max-w-md w-full bg-white shadow-float rounded-2xl border border-slate-200 animate-scaleIn overflow-hidden">
            <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-teal-600" />
                <span>Create User Account</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Assign clinical roles and security permissions for diagnostic personnel.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleCreate}>
              <CardContent className="space-y-3.5 pt-4">
                {modalError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    {modalError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Full Legal Name *
                  </label>
                  <Input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. A. K. M. Shamsuddin"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Email Address *
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@medverify.com"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Initial Password *
                  </label>
                  <Input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 8 characters, 1 uppercase, 1 special"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Clinical Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                    >
                      <option value="DOCTOR">Doctor (Reviewer)</option>
                      <option value="REPORT_OPERATOR">Report Operator</option>
                      <option value="LAB_TECHNICIAN">Lab Technician</option>
                      <option value="ADMIN">System Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Department
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Diagnostic Center"
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between py-3.5 px-5 bg-slate-50/60 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="h-9 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="h-9 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-2xs"
                >
                  {actionLoading ? 'Creating User...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
