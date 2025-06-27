'use client';

import dynamic from 'next/dynamic';

const ConnectivityDiagnostic = dynamic(
  () => import('./ConnectivityDiagnostic'),
  { ssr: false }
);

export default function ConnectivityDiagnosticWrapper() {
  // Só renderizar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <ConnectivityDiagnostic />;
} 