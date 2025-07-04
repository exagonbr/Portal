'use client'

import DashboardPageLayout from './DashboardPageLayout'

// Componente de compatibilidade que redireciona para DashboardPageLayout
export default function DashboardLayout({
  title,
  subtitle,
  children,
  actions
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <DashboardPageLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
    >
      {children}
    </DashboardPageLayout>
  )
}