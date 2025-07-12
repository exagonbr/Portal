'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ToastManager } from '@/components/ToastManager'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationLoadingProvider>
          {children}
          <ToastManager>
            <></>
          </ToastManager>
        </NavigationLoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}