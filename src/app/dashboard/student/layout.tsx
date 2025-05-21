'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout requiredRole="student">
      {children}
    </AuthenticatedLayout>
  )
}
