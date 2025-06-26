'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useToast as useToastHook } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

// Contexto para disponibilizar o toast globalmente
const ToastContext = createContext<ReturnType<typeof useToastHook> | undefined>(undefined);

export function ToastManager({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const toastMethods = useToastHook();

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      {mounted && (
        <ToastContainer 
          toasts={toastMethods.toasts} 
          onRemove={toastMethods.removeToast} 
        />
      )}
    </ToastContext.Provider>
  );
}

// Hook para usar o toast em qualquer componente
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastManager');
  }
  return context;
} 