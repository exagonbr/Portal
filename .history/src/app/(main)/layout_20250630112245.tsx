import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Educacional',
  description: 'Plataforma educacional brasileira com suporte BNCC',
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}