'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="Dashboard Administrativo"
        subtitle="Gerencie todo o sistema educacional"
      >
        {children}
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}
