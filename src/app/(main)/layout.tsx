import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import React from 'react'
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext'

export default function MainLayout({
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
