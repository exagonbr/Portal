'use client'

import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'


export default function InstitutionManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardPageLayout
      title="Dashboard do Gestor Institucional"
      subtitle="Gerencie sua instituição"
    >
      {children}
    </DashboardPageLayout>
  )
}
