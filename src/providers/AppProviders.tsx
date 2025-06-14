'use client'

// REMOVIDO: SessionProvider do NextAuth para evitar erros 404
// import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ToastManager } from '../components/ToastManager'
import { GamificationProvider } from '@/contexts/GamificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';


export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {/* REMOVIDO: SessionProvider para evitar chamadas para /api/auth/session */}
      <ThemeProvider>
        <AuthProvider>
          <ToastManager>
            <GamificationProvider>
              {children}
            </GamificationProvider>
          </ToastManager>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
