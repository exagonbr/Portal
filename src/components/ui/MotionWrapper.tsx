'use client';

import dynamic from 'next/dynamic';
import { ComponentProps, useState, useEffect } from 'react';

// Wrapper para motion.div
export const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { 
    ssr: false,
    loading: () => <div style={{ opacity: 0 }} />
  }
);

// Wrapper para motion.span
export const MotionSpan = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.span),
  { 
    ssr: false,
    loading: () => <span style={{ opacity: 0 }} />
  }
);

// Wrapper para motion.button
export const MotionButton = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.button),
  { 
    ssr: false,
    loading: () => <button style={{ opacity: 0 }} />
  }
);

// Wrapper para motion.h1
export const MotionH1 = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.h1),
  { 
    ssr: false,
    loading: () => <h1 style={{ opacity: 0 }} />
  }
);

// Wrapper para motion.p
export const MotionP = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.p),
  { 
    ssr: false,
    loading: () => <p style={{ opacity: 0 }} />
  }
);

// Wrapper para AnimatePresence
export const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.AnimatePresence })),
  { 
    ssr: false,
    loading: () => null
  }
);

// Hook para verificar se o componente está montado (evita hidratação)
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
};

// Componente condicional que só renderiza no cliente
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}; 