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
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 p-4 z-[100000] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`min-w-[300px] max-w-md w-auto shadow-lg rounded-lg pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out ${
              toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
            } ${
              toast.type === 'success' ? 'bg-success-50 border-l-4 border-success-DEFAULT' :
              toast.type === 'error' ? 'bg-error-50 border-l-4 border-error-DEFAULT' :
              toast.type === 'warning' ? 'bg-warning-50 border-l-4 border-warning-DEFAULT' :
              'bg-info-50 border-l-4 border-info-DEFAULT'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && (
                    <svg className="h-6 w-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {toast.type === 'error' && (
                    <svg className="h-6 w-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {toast.type === 'warning' && (
                    <svg className="h-6 w-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {toast.type === 'info' && (
                    <svg className="h-6 w-6 text-info-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    toast.type === 'success' ? 'text-success-800' :
                    toast.type === 'error' ? 'text-error-800' :
                    toast.type === 'warning' ? 'text-warning-800' :
                    'text-info-800'
                  }`}>
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className={`mt-1 text-sm ${
                      toast.type === 'success' ? 'text-success-700' :
                      toast.type === 'error' ? 'text-error-700' :
                      toast.type === 'warning' ? 'text-warning-700' :
                      'text-info-700'
                    }`}>
                      {toast.message}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className={`rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      toast.type === 'success' ? 'text-success-500 hover:text-success-700 focus:ring-success-500' :
                      toast.type === 'error' ? 'text-error-500 hover:text-error-700 focus:ring-error-500' :
                      toast.type === 'warning' ? 'text-warning-500 hover:text-warning-700 focus:ring-warning-500' :
                      'text-info-500 hover:text-info-700 focus:ring-info-500'
                    }`}
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
    const context = useContext(ToastContext)
    if (!context) return;

    if (typeof messageOrOptions === 'string') {
      context.showToast({
        type: 'success',
        title: 'Sucesso!',
        message: messageOrOptions,
        duration
      })
    } else {
      context.showToast({
        type: 'success',
        title: messageOrOptions.title || 'Sucesso!',
        message: messageOrOptions.message,
        duration: messageOrOptions.duration
      })
    }
  },
  
  error: (messageOrOptions: string | ToastOptions, duration?: number) => {
    const context = useContext(ToastContext)
    if (!context) return;

    if (typeof messageOrOptions === 'string') {
      context.showToast({
        type: 'error',
        title: 'Erro!',
        message: messageOrOptions,
        duration
      })
    } else {
      context.showToast({
        type: 'error',
        title: messageOrOptions.title || 'Erro!',
        message: messageOrOptions.message,
        duration: messageOrOptions.duration
      })
    }
  },
  
  warning: (messageOrOptions: string | ToastOptions, duration?: number) => {
    const context = useContext(ToastContext)
    if (!context) return;

    if (typeof messageOrOptions === 'string') {
      context.showToast({
        type: 'warning',
        title: 'Atenção!',
        message: messageOrOptions,
        duration
      })
    } else {
      context.showToast({
        type: 'warning',
        title: messageOrOptions.title || 'Atenção!',
        message: messageOrOptions.message,
        duration: messageOrOptions.duration
      })
    }
  },
  
  info: (messageOrOptions: string | ToastOptions, duration?: number) => {
    const context = useContext(ToastContext)
    if (!context) return;

    if (typeof messageOrOptions === 'string') {
      context.showToast({
        type: 'info',
        title: 'Informação',
        message: messageOrOptions,
        duration
      })
    } else {
      context.showToast({
        type: 'info',
        title: messageOrOptions.title || 'Informação',
        message: messageOrOptions.message,
        duration: messageOrOptions.duration
      })
    }
  }
}
