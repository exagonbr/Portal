import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext'
import React from 'react'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationLoadingProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </NavigationLoadingProvider>
  )
}