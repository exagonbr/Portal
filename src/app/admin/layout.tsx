'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <NavigationLoadingProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </NavigationLoadingProvider>
    </ErrorBoundary>
  )
}