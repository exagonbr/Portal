import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useForceRevalidation() {
  const router = useRouter()

  useEffect(() => {
    // Forçar revalidação ao montar o componente
    router.refresh()

    // Adicionar listener para revalidar ao voltar à página
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        router.refresh()
      }
    }

    window.addEventListener('pageshow', handlePageShow)

    // Limpar cache do navegador periodicamente
    const clearBrowserCache = async () => {
      if ('caches' in window) {
        try {
          const keys = await caches.keys()
          await Promise.all(keys.map(key => caches.delete(key)))
        } catch (error) {
          console.error('Erro ao limpar cache:', error)
        }
      }
    }

    // Executar limpeza a cada 30 minutos
    const cacheInterval = setInterval(clearBrowserCache, 30 * 60 * 1000)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      clearInterval(cacheInterval)
    }
  }, [router])
} 