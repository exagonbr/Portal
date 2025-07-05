import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import React from 'react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
