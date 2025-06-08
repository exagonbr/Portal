'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={[UserRole.TEACHER, UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="Dashboard do Professor"
        subtitle="Gerencie suas turmas e alunos"
      >
        {children}
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}