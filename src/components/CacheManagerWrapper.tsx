'use client';

import dynamic from 'next/dynamic';

// Importar CacheManager dinamicamente para evitar problemas de SSR
const CacheManager = dynamic(
  () => import('@/components/CacheManager').then(mod => mod.CacheManager),
  { ssr: false }
);

export default function CacheManagerWrapper() {
  return <CacheManager />;
} 