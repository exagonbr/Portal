'use client'

import { usePathname } from 'next/navigation'
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
  '/test-dashboard-simple',
  '/' // Add root route as public
]

// Dashboard routes that have their own layout
const dashboardRoutesWithOwnLayout = [
  '/dashboard/system-admin',
  '/dashboard/institution-manager',
  '/dashboard/coordinator',
  '/dashboard/teacher',
  '/dashboard/student',
  '/dashboard/guardian',
  '/dashboard/admin',
  '/dashboard/manager',
  '/institution',
  '/student',
  '/guardian',
  '/teacher',
  '/coordinator',
  '/admin'
]

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't use dashboard layout for public routes
  if (pathname && publicRoutes.includes(pathname)) {
    return <div className="h-full w-full">{children}</div>
  }

  // Don't use dashboard layout for dashboard routes that have their own layout
  if (pathname && dashboardRoutesWithOwnLayout.some(route => pathname.startsWith(route))) {
    return <>{children}</>
  }

  // Use authenticated dashboard layout for all other routes
  return <AuthenticatedDashboardLayout>{children}</AuthenticatedDashboardLayout>
}
