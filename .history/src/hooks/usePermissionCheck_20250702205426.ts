import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface UsePermissionCheckOptions {
  restrictedRoles?: string[]
  redirectTo?: string
  requireAuth?: boolean
}

export function usePermissionCheck(options: UsePermissionCheckOptions = {}) {
  const {
    restrictedRoles = ['GUARDIAN', 'STUDENT'],
    redirectTo = '/notifications',
    requireAuth = true
  } = options
  
  const { user } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Aguardar um momento para verificar se há usuário
    const checkPermission = async () => {
      // Pequeno delay para garantir que o contexto de auth foi carregado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (requireAuth && !user) {
        console.log('🔐 [usePermissionCheck] Nenhum usuário encontrado, redirecionando para login')
        const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || '';
        const loginUrl = frontendUrl ? `${frontendUrl}/auth/login` : '/auth/login';
        router.push(loginUrl)
        return
      }

      if (user && restrictedRoles.includes(user.role)) {
        console.log('🚫 [usePermissionCheck] Usuário sem permissão, redirecionando')
        const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || '';
        const fullRedirectUrl = redirectTo.startsWith('/') && frontendUrl ? `${frontendUrl}${redirectTo}` : redirectTo;
        router.push(fullRedirectUrl)
        return
      }
      
      setIsChecking(false)
    }

    checkPermission()
  }, [user, router, restrictedRoles, redirectTo, requireAuth])

  const hasPermission = user && !restrictedRoles.includes(user.role)

  return { user, hasPermission, isChecking }
}