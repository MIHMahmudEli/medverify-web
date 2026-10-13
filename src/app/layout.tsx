import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'MedVerify — Clinical Medical Report & Verification Platform',
  description: 'Enterprise Medical Examination, Laboratory Reporting and Online QR Verification Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
