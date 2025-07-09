'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useToast as useToastHook } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

// Criando funções vazias padrão para evitar o erro de "no-op functions"
const defaultToastFunctions = {
  toasts: [],
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
  removeToast: () => {},
  clearAllToasts: () => {},
};

// Contexto para disponibilizar o toast globalmente, inicializado com valores padrão
const ToastContext = createContext<ReturnType<typeof useToastHook>>(defaultToastFunctions as ReturnType<typeof useToastHook>);

export function ToastManager({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const toastMethods = useToastHook();

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setMounted(true);
    // Inicializar imediatamente para evitar o aviso
    setIsReady(true);
  }, []);

  // Sempre fornecer o contexto, mesmo durante o carregamento
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
  
  // Não é mais necessário verificar se o contexto existe, pois ele sempre terá pelo menos as funções padrão
  return context;
} 