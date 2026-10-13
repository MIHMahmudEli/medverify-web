'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Plus, ShieldCheck, UserX, CheckCircle, AlertCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'REPORT_OPERATOR',
    department: 'Data Operations',
  });
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/users', { limit: 50 });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/users', formData);
      setShowCreateModal(false);
      setFormData({
        email: '',
        fullName: '',
        password: '',
        role: 'REPORT_OPERATOR',
        department: 'Data Operations',
      });
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
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
      alert(err.message || 'Action failed');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-purple-900 text-white">SUPER ADMIN</Badge>;
      case 'ADMIN':
        return <Badge className="bg-slate-900 text-white">ADMIN</Badge>;
      case 'DOCTOR':
        return <Badge variant="fit">DOCTOR</Badge>;
      case 'LAB_TECHNICIAN':
        return <Badge variant="pending">LAB TECH</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            User & Role Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage authenticated clinical personnel, departmental roles, and access controls.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Staff Member</span>
        </Button>
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading staff users...</div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-semibold text-slate-900">
                      {u.fullName}
                    </TableCell>
                    <TableCell className="font-mono text-slate-700">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(u.role)}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {u.department || 'General'}
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                          <UserX className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(u)}
                        className={`h-6.5 px-2 text-[11px] ${u.isActive ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white shadow-xl">
            <CardHeader>
              <CardTitle>Create Clinical Staff User</CardTitle>
              <CardDescription>
                Assign clinical roles according to authorized hospital and lab duties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-3 p-2 rounded bg-rose-50 text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              <form id="create-user-form" onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">
                    Full Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dr. Jane Smith"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="jane@medverify.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">
                    Password *
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      Clinical Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="flex h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="DOCTOR">DOCTOR</option>
                      <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
                      <option value="REPORT_OPERATOR">REPORT_OPERATOR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 uppercase">
                      Department
                    </label>
                    <Input
                      placeholder="e.g. Pathology"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between py-3">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-user-form" size="sm">
                Create User
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
