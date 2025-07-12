import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { UserRole } from '@/types/roles'
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext'
import React from 'react'

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationLoadingProvider>
      <AuthenticatedLayout
        requiredRole={[
          UserRole.SYSTEM_ADMIN,
          UserRole.INSTITUTION_MANAGER,
          UserRole.COORDINATOR,
        ]}
      >
        {children}
      </AuthenticatedLayout>
    </NavigationLoadingProvider>
  )
}