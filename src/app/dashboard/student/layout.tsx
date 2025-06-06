'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.STUDENT]}>
      <DashboardPageLayout
        title="Dashboard do Aluno"
        subtitle="Acompanhe seu progresso e atividades"
      >
        {children}
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}