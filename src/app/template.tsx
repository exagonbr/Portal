'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthenticatedDashboardLayout from '@/components/dashboard/AuthenticatedDashboardLayout'

// Routes that should not use the dashboard layout
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/test-simple',
  '/test-dashboard',
  '/test-student',
  '/debug-auth',
  '/test-dashboard-simple', // Keep test route
  '/' // Add root route as public
]

export default function Template({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Verificar se a rota existe
  if (!pathname) {
    return <div className="h-full w-full">{children}</div>
  }

  // Don't use dashboard layout for public routes
  if (publicRoutes.includes(pathname)) {
    return <div className="h-full w-full">{children}</div>
  }

  // Use authenticated dashboard layout for all other routes
  return <AuthenticatedDashboardLayout>{children}</AuthenticatedDashboardLayout>
}
