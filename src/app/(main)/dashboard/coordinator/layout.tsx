'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'


export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardPageLayout
      title="Dashboard do Coordenador"
      subtitle="Gerencie os cursos e turmas"
    >
      {children}
    </DashboardPageLayout>
  )
}
