'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  visible?: boolean
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, visible: false } : toast
      )
    )
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 300)
  }, [])

  const showToast = useCallback(({ type, title, message, duration = 5000 }: Omit<Toast, 'id' | 'visible'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    setToasts(prev => [...prev, { id, type, title, message, duration, visible: true }])
  }, [])

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration && toast.visible) {
        const timer = setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration)
        return () => clearTimeout(timer)
      }
    })
  }, [toasts, removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastListener />
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 p-4 z-[100000] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`min-w-[300px] max-w-md w-auto shadow-lg rounded-lg pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out ${
              toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
            } ${
              toast.type === 'success' ? 'bg-success/90 border-l-4 border-success-DEFAULT' :
              toast.type === 'error' ? 'bg-error/90 border-l-4 border-error-DEFAULT' :
              toast.type === 'warning' ? 'bg-warning/90 border-l-4 border-warning-DEFAULT' :
              'bg-info/90 border-l-4 border-info-DEFAULT'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-white">
                  {toast.type === 'success' && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {toast.type === 'error' && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {toast.type === 'warning' && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {toast.type === 'info' && (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-white">
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="mt-1 text-sm text-white">
                      {toast.message}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="rounded-md inline-flex text-white hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={() => removeToast(toast.id)}
                  >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastOptions {
  title?: string;
  message: string;
  duration?: number;
}

// Helper functions for common toast types
export const toast = {
  success: (messageOrOptions: string | ToastOptions, duration?: number) => {
    const showToastSuccess = (options: ToastOptions) => {
      const context = useContext(ToastContext);
      if (!context) return;
      context.showToast({
        type: 'success',
        title: options.title || 'Sucesso!',
        message: options.message,
        duration: options.duration
      });
    };
    
    if (typeof window === 'undefined') return; // Prevenir execução durante SSR
    
    // Enviar evento personalizado ao invés de usar hook diretamente
    const event = new CustomEvent('toast', {
      detail: {
        type: 'success',
        title: typeof messageOrOptions === 'string' ? 'Sucesso!' : messageOrOptions.title || 'Sucesso!',
        message: typeof messageOrOptions === 'string' ? messageOrOptions : messageOrOptions.message,
        duration: typeof messageOrOptions === 'string' ? duration : messageOrOptions.duration
      }
    });
    window.dispatchEvent(event);
  },
  
  error: (messageOrOptions: string | ToastOptions, duration?: number) => {
    if (typeof window === 'undefined') return; // Prevenir execução durante SSR
    
    // Enviar evento personalizado ao invés de usar hook diretamente
    const event = new CustomEvent('toast', {
      detail: {
        type: 'error',
        title: typeof messageOrOptions === 'string' ? 'Erro!' : messageOrOptions.title || 'Erro!',
        message: typeof messageOrOptions === 'string' ? messageOrOptions : messageOrOptions.message,
        duration: typeof messageOrOptions === 'string' ? duration : messageOrOptions.duration
      }
    });
    window.dispatchEvent(event);
  },
  
  warning: (messageOrOptions: string | ToastOptions, duration?: number) => {
    if (typeof window === 'undefined') return; // Prevenir execução durante SSR
    
    // Enviar evento personalizado ao invés de usar hook diretamente
    const event = new CustomEvent('toast', {
      detail: {
        type: 'warning',
        title: typeof messageOrOptions === 'string' ? 'Atenção!' : messageOrOptions.title || 'Atenção!',
        message: typeof messageOrOptions === 'string' ? messageOrOptions : messageOrOptions.message,
        duration: typeof messageOrOptions === 'string' ? duration : messageOrOptions.duration
      }
    });
    window.dispatchEvent(event);
  },
  
  info: (messageOrOptions: string | ToastOptions, duration?: number) => {
    if (typeof window === 'undefined') return; // Prevenir execução durante SSR
    
    // Enviar evento personalizado ao invés de usar hook diretamente
    const event = new CustomEvent('toast', {
      detail: {
        type: 'info',
        title: typeof messageOrOptions === 'string' ? 'Informação' : messageOrOptions.title || 'Informação',
        message: typeof messageOrOptions === 'string' ? messageOrOptions : messageOrOptions.message,
        duration: typeof messageOrOptions === 'string' ? duration : messageOrOptions.duration
      }
    });
    window.dispatchEvent(event);
  }
}

// Componente para escutar eventos de toast
export function ToastListener() {
  const context = useContext(ToastContext);
  
  useEffect(() => {
    if (!context) return;
    
    const handleToastEvent = (event: CustomEvent) => {
      context.showToast(event.detail);
    };
    
    // TypeScript não reconhece CustomEvent por padrão no addEventListener
    window.addEventListener('toast', handleToastEvent as EventListener);
    
    return () => {
      window.removeEventListener('toast', handleToastEvent as EventListener);
    };
  }, [context]);
  
  return null; // Componente não renderiza nada
}
