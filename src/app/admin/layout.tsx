'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { UserRole } from '@/types/roles'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <AuthenticatedLayout requiredRole={UserRole.SYSTEM_ADMIN}>
        {children}
      </AuthenticatedLayout>
    </ErrorBoundary>
  )
}