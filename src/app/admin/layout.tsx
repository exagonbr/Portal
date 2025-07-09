'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { UserRole } from '@/types/roles'
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
        <AuthenticatedLayout requiredRole={UserRole.SYSTEM_ADMIN}>
          {children}
        </AuthenticatedLayout>
      </NavigationLoadingProvider>
    </ErrorBoundary>
  )
}