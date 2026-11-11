'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Safety fallback: Never leave the user stuck on a loading screen
  useEffect(() => {
    const fallback = setTimeout(() => {
      router.replace(user ? '/dashboard' : '/login');
    }, 2000);
    return () => clearTimeout(fallback);
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Loading MedVerify...</span>
      </div>
    </div>
  );
}
