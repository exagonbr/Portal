import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticação - Portal Educacional',
  description: 'Acesso ao sistema - Login e Registro',
};

export default function AuthSubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-container">
      {children}
    </div>
  );
}