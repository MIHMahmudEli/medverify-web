'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from './api-client';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DOCTOR'
  | 'LAB_TECHNICIAN'
  | 'REPORT_OPERATOR'
  | 'VIEWER';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      // Don't check auth for public verification route
      if (pathname?.startsWith('/verify')) {
        setLoading(false);
        return;
      }

      const token = api.getToken();
      if (!token) {
        setLoading(false);
        if (pathname !== '/login') {
          router.push('/login');
        }
        return;
      }

      try {
        const profile = await api.get<AuthUser>('/auth/me');
        setUser(profile);
      } catch (err) {
        api.setToken(null);
        setUser(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [pathname, router]);

  const login = async (email: string, pass: string) => {
    const res = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', {
      email,
      password: pass,
    });
    api.setToken(res.accessToken);
    setUser(res.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    api.setToken(null);
    setUser(null);
    router.push('/login');
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
