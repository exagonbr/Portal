'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'


export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardPageLayout
      title="Dashboard do Aluno"
      subtitle="Acompanhe seu progresso e atividades"
    >
      {children}
    </DashboardPageLayout>
  )
}