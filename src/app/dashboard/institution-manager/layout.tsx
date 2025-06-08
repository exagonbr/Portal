'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

export default function InstitutionManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.INSTITUTION_MANAGER, UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="Dashboard do Gestor Institucional"
        subtitle="Gerencie sua instituição"
      >
        {children}
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}
