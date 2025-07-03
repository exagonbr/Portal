'use client'

import { usePathname } from 'next/navigation'

// Rotas que não devem usar o layout de dashboard (completamente públicas)
const publicRoutes = [
  '/', // Página inicial (login)
  '/auth/login',
  '/auth/register',
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

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Por enquanto, renderizar apenas o children sem layout complexo
  // para evitar problemas de carregamento de chunks
  return <div className="h-full w-full">{children}</div>
  
  // Código comentado temporariamente:
  /*
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
  */
}
