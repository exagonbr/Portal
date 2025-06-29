'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useNavigationLoading } from '@/contexts/NavigationLoadingContext'

export const useNavigationWithLoading = () => {
  const router = useRouter()
  const { showLoading, hideLoading } = useNavigationLoading()

  const navigateWithLoading = useCallback((
    href: string, 
    options?: {
      message?: string
      delay?: number
      replace?: boolean
    }
  ) => {
    const { 
      message = 'Estamos preparando tudo para você',
      delay = 800,
      replace = false
    } = options || {}

    // Mostrar loading
    showLoading(message)

    // Aguardar um tempo para mostrar o loading antes de navegar
    setTimeout(() => {
      if (replace) {
        router.replace(href)
      } else {
        router.push(href)
      }
      
      // Esconder loading após um pequeno delay para permitir que a página carregue
      setTimeout(() => {
        hideLoading()
      }, 300)
    }, delay)
  }, [router, showLoading, hideLoading])

  const prefetchWithLoading = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  return {
    navigateWithLoading,
    prefetchWithLoading,
    showLoading,
    hideLoading
  }
}