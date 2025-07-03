'use client';

import dynamic from 'next/dynamic';
import { ComponentProps, useState, useEffect } from 'react';

// CORREÇÃO: Wrapper mais robusto com fallbacks
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => {
    if (!mod.motion) {
      console.warn('⚠️ framer-motion não carregou corretamente, usando fallback');
      return { default: ({ children, ...props }: any) => <div {...props}>{children}</div> };
    }
    return mod.motion.div;
  }),
  { 
    ssr: false,
    loading: () => <div style={{ opacity: 0 }} />,
    // CORREÇÃO: Adicionar onError para lidar com falhas de carregamento
  }
);

const MotionSpan = dynamic(
  () => import('framer-motion').then((mod) => {
    if (!mod.motion) {
      return { default: ({ children, ...props }: any) => <span {...props}>{children}</span> };
    }
    return mod.motion.span;
  }),
  { 
    ssr: false,
    loading: () => <span style={{ opacity: 0 }} />
  }
);

const MotionButton = dynamic(
  () => import('framer-motion').then((mod) => {
    if (!mod.motion) {
      return { default: ({ children, ...props }: any) => <button {...props}>{children}</button> };
    }
    return mod.motion.button;
  }),
  { 
    ssr: false,
    loading: () => <button style={{ opacity: 0 }} />
  }
);

const MotionH1 = dynamic(
  () => import('framer-motion').then((mod) => {
    if (!mod.motion) {
      return { default: ({ children, ...props }: any) => <h1 {...props}>{children}</h1> };
    }
    return mod.motion.h1;
  }),
  { 
    ssr: false,
    loading: () => <h1 style={{ opacity: 0 }} />
  }
);

const MotionP = dynamic(
  () => import('framer-motion').then((mod) => {
    if (!mod.motion) {
      return { default: ({ children, ...props }: any) => <p {...props}>{children}</p> };
    }
    return mod.motion.p;
  }),
  { 
    ssr: false,
    loading: () => <p style={{ opacity: 0 }} />
  }
);

const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => {
    if (!mod.AnimatePresence) {
      return { default: ({ children }: any) => <>{children}</> };
    }
    return { default: mod.AnimatePresence };
  }),
  { 
    ssr: false,
    loading: () => null
  }
);

// Hook para verificar se está no cliente
function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}

// Componente para renderizar apenas no cliente
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
  const isClient = useIsClient();
  
  if (!isClient) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// CORREÇÃO: Componente wrapper com tratamento de erro
interface MotionWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const MotionWrapper: React.FC<MotionWrapperProps> = ({ children, fallback = null }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Verificar se framer-motion está disponível
    const checkFramerMotion = async () => {
      try {
        await import('framer-motion');
      } catch (error) {
        console.warn('⚠️ framer-motion não pôde ser carregado:', error);
        setHasError(true);
      }
    };
    
    checkFramerMotion();
  }, []);
  
  if (hasError) {
    return <>{fallback || children}</>;
  }
  
  return (
    <ClientOnly fallback={fallback}>
      {children}
    </ClientOnly>
  );
};

export { 
  MotionDiv, 
  MotionSpan, 
  MotionButton, 
  MotionH1, 
  MotionP, 
  AnimatePresence, 
  ClientOnly,
  MotionWrapper
}; 