import type { Metadata } from 'next';
import { AuthErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Autenticação - Portal Educacional',
  description: 'Login e registro no Portal Educacional',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
        {children}
      </div>
    </AuthErrorBoundary>
  );
}