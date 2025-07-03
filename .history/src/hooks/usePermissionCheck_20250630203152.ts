import { useEffect } from 'react'
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

  useEffect(() => {
    if (requireAuth && !user) {
      router.push('/auth/login')
      return
    }

    if (user && restrictedRoles.includes(user.role)) {
      router.push(redirectTo)
      return
    }
  }, [user, router, restrictedRoles, redirectTo, requireAuth])

  const hasPermission = user && !restrictedRoles.includes(user.role)

  return { user, hasPermission }
}