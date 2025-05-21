'use client'

import AuthenticatedLayout from '@/components/AuthenticatedLayout'

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout requiredRole="teacher">
      {children}
    </AuthenticatedLayout>
  )
}
