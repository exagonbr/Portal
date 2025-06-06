'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.ACADEMIC_COORDINATOR]}>
      <DashboardPageLayout
        title="Dashboard do Coordenador"
        subtitle="Gerencie os cursos e turmas"
      >
        {children}
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}
