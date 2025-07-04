'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/dashboard/DashboardPageLayout'
import { UserRole } from '@/types/roles'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ErrorRecoveryModal } from '@/components/ui/LoadingModal'
import { AuthProvider } from '@/contexts/AuthContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
          <DashboardLayout title="Admin Dashboard">
            {children}
          </DashboardLayout>
        </ProtectedRoute>
      </ErrorBoundary>
    </AuthProvider>
  )
}