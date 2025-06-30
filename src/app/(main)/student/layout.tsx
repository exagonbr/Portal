'use client'

import AuthenticatedDashboardLayout from '@/components/dashboard/AuthenticatedDashboardLayout'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedDashboardLayout>
      {children}
    </AuthenticatedDashboardLayout>
  )
} 