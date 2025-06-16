'use client'

// REMOVIDO: SessionProvider do NextAuth para evitar erros 404
// import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ToastManager } from '../components/ToastManager'
import { GamificationProvider } from '@/contexts/GamificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';


export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {/* REMOVIDO: SessionProvider para evitar chamadas para /api/auth/session */}
      <ThemeProvider>
        <AuthProvider>
          <ToastManager>
            <GamificationProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4aed88',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ff6b6b',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </GamificationProvider>
          </ToastManager>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
