import type { Metadata } from 'next';
import { Suspense } from 'react';

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
    <div className="auth-container">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}