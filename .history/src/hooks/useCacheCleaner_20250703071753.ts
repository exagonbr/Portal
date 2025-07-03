'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook para limpar cache automaticamente em mudanças de rota
 * Previne problemas de cache que podem interferir com redirecionamentos e autenticação
 */
export function useCacheCleaner() {
  const router = useRouter();
  const pathname = usePathname();
  const previousPathname = useRef<string>('');
  const isInitialized = useRef(false);

  // Função para limpar diferentes tipos de cache
  const clearAllCaches = async () => {
    try {
      // 1. Limpar cache do Service Worker (se existir)
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🧹 Cache do Service Worker limpo');
      }

      // 2. Limpar cache do navegador para recursos específicos
      if ('caches' in window) {
        const cache = await caches.open('dynamic-cache');
        const requests = await cache.keys();
        await Promise.all(
          requests.map(request => cache.delete(request))
        );
        console.log('🧹 Cache dinâmico limpo');
      }

      // 3. Forçar revalidação de recursos estáticos
      if (typeof window !== 'undefined') {
        // Adicionar timestamp para forçar reload de recursos
        const timestamp = Date.now();
        const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
        if (metaRefresh) {
          metaRefresh.remove();
        }
        
        // Criar nova meta tag para forçar refresh
        const newMeta = document.createElement('meta');
        newMeta.setAttribute('http-equiv', 'cache-control');
        newMeta.setAttribute('content', 'no-cache, no-store, must-revalidate');
        document.head.appendChild(newMeta);
        
        console.log(`🧹 Cache do navegador invalidado - timestamp: ${timestamp}`);
      }

      // 4. Limpar cache de imagens e recursos
      if (typeof window !== 'undefined') {
        // Forçar reload de imagens em cache
        const images = document.querySelectorAll('img[src]');
        images.forEach((img: any) => {
          if (img.src && !img.src.includes('?v=')) {
            const separator = img.src.includes('?') ? '&' : '?';
            img.src = `${img.src}${separator}v=${Date.now()}`;
          }
        });
        
        console.log('🧹 Cache de imagens invalidado');
      }

    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache:', error);
    }
  };

  // Função para limpar cache específico de autenticação
  const clearAuthCache = () => {
    if (typeof window === 'undefined') return;

    try {
      // Limpar localStorage relacionado à autenticação
      const authKeys = [
        'accessToken',
        'refreshToken',
        'auth_token',
        'user',
        'user_data',
        'auth_expires_at',
        'session_id',
        'login_redirect_loop_check'
      ];

      authKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Limpar sessionStorage
      const sessionKeys = [
        'auth_state',
        'redirect_after_login',
        'login_redirect_loop_check'
      ];

      sessionKeys.forEach(key => {
        sessionStorage.removeItem(key);
      });

      console.log('🧹 Cache de autenticação limpo');
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache de autenticação:', error);
    }
  };

  // Função para limpar cache de API
  const clearApiCache = () => {
    if (typeof window === 'undefined') return;

    try {
      // Limpar cache de requisições API
      const apiCacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('api_cache_') || 
        key.startsWith('query_cache_') ||
        key.startsWith('swr-')
      );

      apiCacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('🧹 Cache de API limpo');
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache de API:', error);
    }
  };

  // Função principal de limpeza
  const performCacheCleanup = async (reason: string) => {
    console.log(`🧹 Iniciando limpeza de cache - Motivo: ${reason}`);
    
    // Limpeza básica sempre
    clearAuthCache();
    clearApiCache();
    
    // Limpeza completa em mudanças de rota importantes
    const isImportantRoute = pathname.includes('/auth/') || 
                            pathname.includes('/dashboard/') ||
                            pathname.includes('/login') ||
                            pathname.includes('/logout');
    
    if (isImportantRoute) {
      await clearAllCaches();
    }
    
    console.log('✅ Limpeza de cache concluída');
  };

  // Efeito para detectar mudanças de rota
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      previousPathname.current = pathname;
      
      // Limpeza inicial
      performCacheCleanup('inicialização');
      return;
    }

    // Detectar mudança de rota
    if (previousPathname.current !== pathname) {
      console.log(`🔄 Mudança de rota detectada: ${previousPathname.current} → ${pathname}`);
      
      performCacheCleanup(`mudança de rota: ${pathname}`);
      previousPathname.current = pathname;
    }
  }, [pathname]);

  // Efeito para limpar cache em eventos específicos
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Limpar cache antes de sair da página
    const handleBeforeUnload = () => {
      performCacheCleanup('saída da página');
    };

    // Limpar cache quando a página fica visível novamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performCacheCleanup('página visível novamente');
      }
    };

    // Limpar cache em mudanças de foco
    const handleFocus = () => {
      performCacheCleanup('foco na página');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Retornar funções para limpeza manual
  return {
    clearAllCaches,
    clearAuthCache,
    clearApiCache,
    performCacheCleanup
  };
}

/**
 * Hook simplificado para limpeza automática de cache
 * Use este quando quiser apenas a funcionalidade automática
 */
export function useAutoCacheCleaner() {
  useCacheCleaner();
}

/**
 * Hook para limpeza de cache em componentes específicos
 * @param triggers - Array de dependências que acionam a limpeza
 */
export function useCacheCleanerWithTriggers(triggers: any[] = []) {
  const { performCacheCleanup } = useCacheCleaner();

  useEffect(() => {
    if (triggers.length > 0) {
      performCacheCleanup(`trigger personalizado: ${JSON.stringify(triggers)}`);
    }
  }, triggers);
}

export default useCacheCleaner;