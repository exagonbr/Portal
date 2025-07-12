'use client';

import dynamic from 'next/dynamic';

// Importar o componente de diagnóstico do Service Worker dinamicamente
const ServiceWorkerDiagnostic = dynamic(
  () => import('@/components/ServiceWorkerDiagnostic'),
  { ssr: false }
);

export default function ServiceWorkerDebugPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico do Service Worker</h1>
      <ServiceWorkerDiagnostic />
    </div>
  );
} 