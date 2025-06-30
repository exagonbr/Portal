'use client';

import dynamic from 'next/dynamic';
import { isDevelopment } from '@/utils/env';

const ConnectivityDiagnostic = dynamic(
  () => import('./ConnectivityDiagnostic'),
  { ssr: false }
);

export default function ConnectivityDiagnosticWrapper() {
  // Só renderizar em desenvolvimento
  if (!isDevelopment()) {
    return null;
  }

  return <ConnectivityDiagnostic />;
} 