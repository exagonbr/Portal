'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/dashboard/DashboardPageLayout'
import { UserRole } from '@/types/roles'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorRecoveryModal } from '@/components/ui/LoadingModal'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
        <DashboardLayout title="Admin Dashboard">
          {children}
        </DashboardLayout>
      </ProtectedRoute>
    </ErrorBoundary>
  )
} 