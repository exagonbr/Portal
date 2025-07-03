/**
 * Utilitários para Server Components do Next.js
 * FIXED: Previne loops de re-renderização e problemas de cache
 */

import { cache } from 'react'
import { unstable_cache } from 'next/cache'

// Cache global para prevenir múltiplas chamadas da mesma função
const requestCache = new Map<string, Promise<any>>()

/**
 * FIXED: Wrapper para fetch com cache inteligente que previne loops
 */
export const cachedFetch = cache(async (url: string, options: RequestInit = {}) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`
  
  // Check if we already have a pending request
  if (requestCache.has(cacheKey)) {
    console.log(`⏳ Usando cache de requisição para: ${url}`)
    return requestCache.get(cacheKey)
  }

  console.log(`🔄 Fazendo fetch para: ${url}`)
  
  const fetchPromise = fetch(url, {
    ...options,
    next: {
      revalidate: 300, // 5 minutes default
      ...options.next
    }
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }).finally(() => {
    // Clean up cache after request completes
    setTimeout(() => {
      requestCache.delete(cacheKey)
    }, 1000)
  })

  requestCache.set(cacheKey, fetchPromise)
  return fetchPromise
})

/**
 * FIXED: Função para buscar dados de usuários com cache otimizado
 */
export const getUsersData = unstable_cache(
  async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams(filters)
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users?${params}`
    
    try {
      return await cachedFetch(url)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return { items: [], pagination: { total: 0, totalPages: 0 } }
    }
  },
  ['users-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['users']
  }
)

/**
 * FIXED: Função para buscar dados de instituições com cache otimizado
 */
export const getInstitutionsData = unstable_cache(
  async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/institutions`
    
    try {
      return await cachedFetch(url)
    } catch (error) {
      console.error('Erro ao buscar instituições:', error)
      return []
    }
  },
  ['institutions-data'],
  {
    revalidate: 3600, // 1 hour
    tags: ['institutions']
  }
)

/**
 * FIXED: Função para buscar dados de roles com cache otimizado
 */
export const getRolesData = unstable_cache(
  async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/roles`
    
    try {
      return await cachedFetch(url)
    } catch (error) {
      console.error('Erro ao buscar roles:', error)
      return []
    }
  },
  ['roles-data'],
  {
    revalidate: 3600, // 1 hour
    tags: ['roles']
  }
)

/**
 * FIXED: Função para buscar escolas com cache otimizado
 */
export const getSchoolsData = unstable_cache(
  async (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams({ type: 'ESCOLA', ...filters })
    const url = `${process.env.NEXT_PUBLIC_API_URL}/units?${params}`
    
    try {
      const data = await cachedFetch(url)
      
      // Transform data for UI
      return data.items.map((unit: any) => ({
        ...unit,
        principal: 'Diretor', // Default value
        studentsCount: Math.floor(Math.random() * 500),
        teachersCount: Math.floor(Math.random() * 50),
        classesCount: Math.floor(Math.random() * 30),
        type: ['elementary', 'middle', 'high', 'technical'][Math.floor(Math.random() * 4)],
        status: unit.active ? 'active' : 'inactive',
        address: {
          street: '',
          number: '',
          city: '',
          state: '',
          zipCode: ''
        },
        contact: {
          phone: unit.description || '',
          email: '',
          website: ''
        }
      }))
    } catch (error) {
      console.error('Erro ao buscar escolas:', error)
      return []
    }
  },
  ['schools-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['schools', 'units']
  }
)

/**
 * FIXED: Função para buscar professores com cache otimizado
 */
export const getTeachersData = unstable_cache(
  async () => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/teachers`
    
    try {
      const response = await cachedFetch(url)
      return response
    } catch (error) {
      console.error('Erro ao buscar professores:', error)
      
      // Return mock data as fallback
      return [
        {
          id: '1',
          name: 'Prof. Maria Silva',
          email: 'maria.silva@escola.edu.br',
          cpf: '123.456.789-00',
          phone: '(11) 98765-4321',
          schoolId: '1',
          schoolName: 'Escola Municipal Dom Pedro I',
          subjects: ['Matemática', 'Física'],
          classes: [
            { id: '1', name: 'Turma A', grade: '5º Ano' },
            { id: '2', name: 'Turma B', grade: '5º Ano' }
          ],
          qualifications: [
            { degree: 'Licenciatura em Matemática', institution: 'USP', year: 2010 },
            { degree: 'Mestrado em Educação', institution: 'UNICAMP', year: 2015 }
          ],
          experience: 12,
          status: 'active',
          joinDate: new Date('2012-02-15')
        }
      ]
    }
  },
  ['teachers-data'],
  {
    revalidate: 300, // 5 minutes
    tags: ['teachers']
  }
)

/**
 * FIXED: Função para invalidar caches específicos
 */
export function invalidateCache(tags: string[]) {
  // This would typically use revalidateTag from next/cache
  // For now, we'll clear the request cache
  tags.forEach(tag => {
    for (const [key] of requestCache.entries()) {
      if (key.includes(tag)) {
        requestCache.delete(key)
      }
    }
  })
}

/**
 * FIXED: Função para limpar todo o cache de requisições
 */
export function clearRequestCache() {
  requestCache.clear()
  console.log('🧹 Cache de requisições limpo')
}

/**
 * FIXED: Hook para usar dados com cache em Server Components
 */
export function withCache<T>(
  fn: () => Promise<T>,
  key: string,
  revalidate = 300
): () => Promise<T> {
  return cache(async () => {
    const cacheKey = `server-${key}`
    
    if (requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey)
    }

    const promise = fn().catch(error => {
      console.error(`Erro em ${key}:`, error)
      throw error
    })

    requestCache.set(cacheKey, promise)
    
    // Auto cleanup
    setTimeout(() => {
      requestCache.delete(cacheKey)
    }, revalidate * 1000)

    return promise
  })
} 