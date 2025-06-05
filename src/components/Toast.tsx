'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const { theme } = useTheme()

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback(({ type, message, duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, message, duration }])
  }, [])

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          removeToast(toast.id)
        }, toast.duration)
        return () => clearTimeout(timer)
      }
    })
  }, [toasts, removeToast])

  const getToastColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          border: theme.colors.status.success,
          icon: theme.colors.status.success,
          text: theme.colors.text.primary,
          bg: theme.colors.background.card
        }
      case 'error':
        return {
          border: theme.colors.status.error,
          icon: theme.colors.status.error,
          text: theme.colors.text.primary,
          bg: theme.colors.background.card
        }
      case 'warning':
        return {
          border: theme.colors.status.warning,
          icon: theme.colors.status.warning,
          text: theme.colors.text.primary,
          bg: theme.colors.background.card
        }
      case 'info':
      default:
        return {
          border: theme.colors.status.info,
          icon: theme.colors.status.info,
          text: theme.colors.text.primary,
          bg: theme.colors.background.card
        }
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 p-4 z-[100000] space-y-4">
        <AnimatePresence>
          {toasts.map(toast => {
            const colors = getToastColors(toast.type)
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-opacity-5 overflow-hidden border-l-4"
                style={{
                  backgroundColor: colors.bg,
                  borderLeftColor: colors.border,
                  borderColor: theme.colors.border.light,
                  boxShadow: theme.shadows.lg
                }}
              >
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {toast.type === 'success' && (
                        <svg className="h-6 w-6" style={{ color: colors.icon }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {toast.type === 'error' && (
                        <svg className="h-6 w-6" style={{ color: colors.icon }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {toast.type === 'warning' && (
                        <svg className="h-6 w-6" style={{ color: colors.icon }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {toast.type === 'info' && (
                        <svg className="h-6 w-6" style={{ color: colors.icon }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium" style={{ color: colors.text }}>
                        {toast.message}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 p-1"
                        style={{ 
                          color: theme.colors.text.tertiary
                        }}
                        onClick={() => removeToast(toast.id)}
                        onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.text.secondary}
                        onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.text.tertiary}
                      >
                        <span className="sr-only">Fechar</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
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

// Helper functions for common toast types
export const toast = {
  success: (message: string, duration?: number) => {
    const context = useContext(ToastContext)
    context?.showToast({ type: 'success', message, duration })
  },
  error: (message: string, duration?: number) => {
    const context = useContext(ToastContext)
    context?.showToast({ type: 'error', message, duration })
  },
  warning: (message: string, duration?: number) => {
    const context = useContext(ToastContext)
    context?.showToast({ type: 'warning', message, duration })
  },
  info: (message: string, duration?: number) => {
    const context = useContext(ToastContext)
    context?.showToast({ type: 'info', message, duration })
  }
}
