'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardPageLayout
      title="Dashboard do Professor"
      subtitle="Gerencie suas turmas e alunos"
    >
      {children}
    </DashboardPageLayout>
  )
}