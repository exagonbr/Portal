'use client'

import React, { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { setupGlobalErrorHandler } from '@/utils/errorHandling'
import { isDevelopment } from '@/utils/env'
import { suppressHydrationWarnings } from '@/utils/suppressHydrationWarnings'
import { ErrorBoundary } from 'react-error-boundary';

// Dynamically import AuthProvider to ensure client-side rendering
const AuthProvider = dynamic(() =>
  import('../contexts/AuthContext')
    .then(mod => mod.AuthProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading AuthProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const ThemeProvider = dynamic(() =>
  import('@/contexts/ThemeContext')
    .then(mod => mod.ThemeProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading ThemeProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const GamificationProvider = dynamic(() =>
  import('@/contexts/GamificationContext')
    .then(mod => mod.GamificationProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading GamificationProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const NavigationLoadingProvider = dynamic(() =>
  import('@/contexts/NavigationLoadingContext')
    .then(mod => mod.NavigationLoadingProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading NavigationLoadingProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

const ToastManager = dynamic(() =>
  import('@/components/ToastManager')
    .then(mod => mod.ToastManager)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading ToastManager:', error);
      }
      return () => null;
    }), {
  ssr: false,
  loading: () => null
})

const UpdateProvider = dynamic(() =>
  import('@/components/PWAUpdateManager')
    .then(mod => mod.UpdateProvider)
    .catch(error => {
      if (isDevelopment()) {
        console.log('Error loading UpdateProvider:', error);
      }
      return ({ children }: { children: ReactNode }) => <>{children}</>;
    }), {
  ssr: false,
  loading: () => null
})

function ErrorBoundaryFallback({ error }: { error: Error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

export default function SimpleProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <AuthProvider>
        <ThemeProvider>
          <GamificationProvider>
            <NavigationLoadingProvider>
              <UpdateProvider>
              <ToastManager>
                {children}
              </ToastManager>
              </UpdateProvider>
            </NavigationLoadingProvider>
          </GamificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}