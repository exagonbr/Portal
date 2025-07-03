'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useToast as useToastHook } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

// Contexto para disponibilizar o toast globalmente
const ToastContext = createContext<ReturnType<typeof useToastHook> | undefined>(undefined);

export function ToastManager({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const toastMethods = useToastHook();

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setMounted(true);
    // Pequeno delay para garantir que tudo esteja inicializado
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Sempre fornecer o contexto, mesmo durante o carregamento
  return (
    <ToastContext.Provider value={isReady ? toastMethods : undefined}>
      {children}
      {mounted && isReady && (
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
  
  // Durante o carregamento, retornar funções vazias para evitar erros
  if (!context) {
    console.warn('useToast called before ToastManager is ready, returning no-op functions');
    return {
      toasts: [],
      showToast: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
      showInfo: () => {},
      removeToast: () => {},
      clearAllToasts: () => {},
    };
  }
  
  return context;
} 