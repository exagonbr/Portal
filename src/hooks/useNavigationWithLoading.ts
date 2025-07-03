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
      message = 'Carregando...', // Mensagem mais genérica
      delay = 150, // Delay reduzido para navegação mais rápida
      replace = false
    } = options || {}

    // Mostrar loading
    showLoading(message)

    // Força a atualização dos dados da rota, limpando o cache do cliente.
    router.refresh();

    // Aguardar um tempo mínimo para a UI de loading ser visível
    setTimeout(() => {
      if (replace) {
        router.replace(href)
      } else {
        router.push(href)
      }
      
      // Esconder loading após um pequeno delay para permitir que a página comece a renderizar
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