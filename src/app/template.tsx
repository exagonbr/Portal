'use client'

import { usePathname } from 'next/navigation'
import AuthenticatedDashboardLayout from '@/components/dashboard/AuthenticatedDashboardLayout'

// Rotas que não devem usar o layout de dashboard (completamente públicas)
const publicRoutes = [
  '/', // Página inicial (login)
  '/login',
  '/register',
  '/forgot-password',
  '/auth-error',
  '/offline',
  // Rotas do portal público
  '/portal',
  '/portal/books',
  '/portal/videos', 
  '/portal/courses',
  '/portal/assignments',
  '/portal/dashboard',
  '/portal/student',
  '/portal/reports',
  // Rotas de teste e debug
  '/test-simple',
  '/test-dashboard',
  '/test-student',
  '/debug-auth',
  '/test-dashboard-simple',
  '/test-auth-integration',
  '/test-julia-login',
  '/test-login'
]

// Rotas de dashboard que têm seu próprio layout interno
const dashboardRoutesWithOwnLayout = [
  '/dashboard/system-admin',
  '/dashboard/institution-manager',
  '/dashboard/coordinator',
  '/dashboard/teacher',
  '/dashboard/student',
  '/dashboard/guardian',
  '/dashboard/admin',
  '/dashboard/manager',
  '/dashboard/institution-admin',
  // Rotas de roles específicas
  '/institution',
  '/student',
  '/guardian',
  '/teacher',
  '/coordinator',
  '/admin'
]

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Não usar layout de dashboard para rotas públicas
  if (pathname && publicRoutes.includes(pathname)) {
    return <div className="h-full w-full">{children}</div>
  }

  // Verificar se é uma rota de teste que começa com prefixo
  if (pathname && (pathname.startsWith('/test-') || pathname.startsWith('/debug-'))) {
    return <div className="h-full w-full">{children}</div>
  }

  // Não usar layout de dashboard para rotas que têm seu próprio layout
  if (pathname && dashboardRoutesWithOwnLayout.some(route => pathname.startsWith(route))) {
    return <>{children}</>
  }

  // Usar layout de dashboard autenticado para todas as outras rotas
  return <AuthenticatedDashboardLayout>{children}</AuthenticatedDashboardLayout>
}
