import type { Metadata } from 'next';
import UnauthenticatedLayout from '@/components/layout/UnauthenticatedLayout';

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
    <UnauthenticatedLayout>
      {children}
    </UnauthenticatedLayout>
  );
}