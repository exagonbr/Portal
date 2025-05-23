'use client'

import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import { useAuth } from '../../contexts/AuthContext'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const requiredRole = pathname.includes('/student') ? 'student' : pathname.includes('/teacher') ? 'teacher' : undefined

  return (
    <AuthenticatedLayout requiredRole={requiredRole}>
      {children}
    </AuthenticatedLayout>
  )
}
