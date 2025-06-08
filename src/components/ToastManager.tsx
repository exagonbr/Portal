'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useToast as useToastHook } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

// Contexto para disponibilizar o toast globalmente
const ToastContext = createContext<ReturnType<typeof useToastHook> | undefined>(undefined);

export function ToastManager({ children }: { children: ReactNode }) {
  const toastMethods = useToastHook();

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <ToastContainer 
        toasts={toastMethods.toasts} 
        onRemove={toastMethods.removeToast} 
      />
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