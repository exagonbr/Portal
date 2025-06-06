'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.GUARDIAN]}>
      <DashboardPageLayout
        title="Dashboard do Responsável"
        subtitle="Acompanhe o progresso dos alunos"
      >
        {children}
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}
