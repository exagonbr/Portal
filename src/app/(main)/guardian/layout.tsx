'use client'

import AuthenticatedDashboardLayout from '@/components/dashboard/AuthenticatedDashboardLayout'

export default function GuardianLayout({
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