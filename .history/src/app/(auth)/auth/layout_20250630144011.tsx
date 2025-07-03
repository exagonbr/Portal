import type { Metadata } from 'next';
import { OptimizedLayout } from '@/components/layout/OptimizedLayout';

export const metadata: Metadata = {
  title: 'Autenticação - Portal Educacional',
  description: 'Login e registro no Portal Educacional',
};

// Layout específico para auth que evita problemas de hidratação
export default function AuthSubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OptimizedLayout className="auth-container">
      {children}
    </OptimizedLayout>
  );
}