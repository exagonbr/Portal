'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardPageLayout
      title="Dashboard Administrativo"
      subtitle="Gerencie todo o sistema educacional"
    >
      {children}
    </DashboardPageLayout>
  )
}
