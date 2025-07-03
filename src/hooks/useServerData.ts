import { useState, useEffect, useRef, useCallback } from 'react'

interface UseServerDataOptions<T> {
  initialData?: T
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  refreshInterval?: number
  onError?: (error: Error) => void
}

interface UseServerDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  mutate: (data?: T) => void
  refresh: () => void
}

/**
 * Hook para gerenciar dados de Server Components e prevenir loops de re-renderização
 * FIXED: Implementa padrões corretos para evitar loops infinitos
 */
export function useServerData<T>(
  key: string,
  fetcher?: () => Promise<T>,
  options: UseServerDataOptions<T> = {}
): UseServerDataReturn<T> {
  const {
    initialData,
    revalidateOnFocus = false,
    revalidateOnReconnect = false,
    refreshInterval,
    onError
  } = options

  // State management
  const [data, setData] = useState<T | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<Error | null>(null)

  // Refs to prevent stale closures and manage state
  const isMountedRef = useRef(true)
  const fetchingRef = useRef(false)
  const lastFetchRef = useRef<number>(0)
  const dataRef = useRef<T | null>(initialData || null)

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // FIXED: Stable fetch function that prevents concurrent calls
  const fetchData = useCallback(async (force = false) => {
    if (!fetcher || !isMountedRef.current) return
    
    // Prevent concurrent fetches
    if (fetchingRef.current && !force) {
      console.log(`⏳ Fetch já em andamento para ${key}, ignorando...`)
      return
    }

    // Rate limiting - prevent too frequent calls
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchRef.current
    if (timeSinceLastFetch < 1000 && !force) {
      console.log(`⏱️ Rate limit ativo para ${key}, aguardando...`)
      return
    }

    fetchingRef.current = true
    lastFetchRef.current = now

    try {
      if (force || !dataRef.current) {
        setLoading(true)
      }
      setError(null)

      console.log(`🔄 Buscando dados para ${key}...`)
      const result = await fetcher()

      if (isMountedRef.current) {
        setData(result)
        dataRef.current = result
        setError(null)
        console.log(`✅ Dados carregados para ${key}`)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      console.error(`❌ Erro ao buscar dados para ${key}:`, error)
      
      if (isMountedRef.current) {
        setError(error)
        onError?.(error)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
      fetchingRef.current = false
    }
  }, [key, fetcher, onError])

  // FIXED: Manual refresh function
  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  // FIXED: Mutate function to update data manually
  const mutate = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData)
      dataRef.current = newData
    } else {
      // If no data provided, refresh
      refresh()
    }
  }, [refresh])

  // FIXED: Initial data fetch with proper dependency management
  useEffect(() => {
    if (!initialData && fetcher) {
      // Small delay to prevent immediate fetch loops
      const timeoutId = setTimeout(() => {
        fetchData()
      }, 50)
      
      return () => clearTimeout(timeoutId)
    }
  }, []) // Empty dependency array - only run once

  // FIXED: Focus revalidation
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchData()
      }
    }

    document.addEventListener('visibilitychange', handleFocus)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleFocus)
      window.removeEventListener('focus', handleFocus)
    }
  }, [revalidateOnFocus, fetchData])

  // FIXED: Reconnect revalidation
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      fetchData()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [revalidateOnReconnect, fetchData])

  // FIXED: Refresh interval
  useEffect(() => {
    if (!refreshInterval) return

    const intervalId = setInterval(() => {
      fetchData()
    }, refreshInterval)

    return () => clearInterval(intervalId)
  }, [refreshInterval, fetchData])

  return {
    data,
    loading,
    error,
    mutate,
    refresh
  }
}

/**
 * Hook especializado para dados de usuários com prevenção de loops
 */
export function useUsersServerData(initialUsers?: any[]) {
  return useServerData('users', undefined, {
    initialData: initialUsers,
    revalidateOnFocus: false, // Disable to prevent loops
    revalidateOnReconnect: true,
    onError: (error) => {
      console.error('Erro ao carregar usuários:', error)
    }
  })
}

/**
 * Hook especializado para dados de instituições com prevenção de loops
 */
export function useInstitutionsServerData(initialInstitutions?: any[]) {
  return useServerData('institutions', undefined, {
    initialData: initialInstitutions,
    revalidateOnFocus: false, // Disable to prevent loops
    revalidateOnReconnect: true,
    onError: (error) => {
      console.error('Erro ao carregar instituições:', error)
    }
  })
} 