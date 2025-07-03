import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal - Portal Educacional',
  description: 'Portal público com conteúdos educacionais',
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Portal Educacional</h1>
        </div>
      </header>
      <main className="container mx-auto py-8">
        {children}
      </main>
    </div>
  );
}