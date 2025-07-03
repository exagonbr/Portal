import type { Metadata } from 'next';

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
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
      {children}
    </div>
  );
}