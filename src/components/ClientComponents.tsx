"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar o ServiceWorkerRegistration dinamicamente para evitar problemas de SSR
const ServiceWorkerRegistrationDynamic = dynamic(
  () => import('@/components/ServiceWorkerRegistration'),
  { ssr: false }
);

export function ClientWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Usar um pequeno delay para garantir que o componente seja montado após a hidratação
    const timer = setTimeout(() => {
      setMounted(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Só renderizar o ServiceWorkerRegistration após a montagem completa
  return (
    <>
      {mounted && <ServiceWorkerRegistrationDynamic />}
    </>
  );
} 