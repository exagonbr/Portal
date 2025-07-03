'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'


export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardPageLayout
      title="Dashboard do Responsável"
      subtitle="Acompanhe o progresso dos alunos"
    >
      {children}
    </DashboardPageLayout>
  )
}
