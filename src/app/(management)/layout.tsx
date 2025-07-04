import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { UserRole } from '@/types/roles'
import React from 'react'

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout
      requiredRole={[
        UserRole.SYSTEM_ADMIN,
        UserRole.INSTITUTION_MANAGER,
        UserRole.COORDINATOR,
      ]}
    >
      {children}
    </AuthenticatedLayout>
  )
}