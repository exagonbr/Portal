'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ToastProvider } from '../components/Toast'
import { GamificationProvider } from '@/contexts/GamificationContext';


export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AuthProvider>
          <ToastProvider>
            <GamificationProvider>
              {children}
            </GamificationProvider>
          </ToastProvider>
        </AuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}
