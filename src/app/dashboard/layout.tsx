'use client'

import AuthenticatedLayout from '../../components/AuthenticatedLayout'
import { useAuth } from '../../contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { UserRole } from '../../types/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const requiredRole: UserRole | undefined = pathname.includes('/student') 
    ? 'student' 
    : pathname.includes('/teacher') 
    ? 'teacher' 
    : undefined

  return (
    <AuthenticatedLayout requiredRole={requiredRole}>
      {children}
    </AuthenticatedLayout>
  )
}
