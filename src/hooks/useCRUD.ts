import { useState, useCallback, useEffect } from 'react'
import { BaseApiService, PaginatedResponse, handleApiError } from '@/lib/api-client'

interface UseCRUDOptions<T> {
  service: BaseApiService<T>
  entityName: string
  onSuccess?: (action: 'create' | 'update' | 'delete', data?: T) => void
  onError?: (action: 'create' | 'update' | 'delete' | 'fetch', error: any) => void
  autoFetch?: boolean
  paginated?: boolean
}

interface UseCRUDReturn<T> {
  // Estado
  data: T[]
  loading: boolean
  error: string | null
  selectedItem: T | null
  
  // Paginação
  pagination: {
    currentPage: number
    pageSize: number
    total: number
    totalPages: number
  }
  
  // Ações
  fetchData: (params?: any) => Promise<void>
  create: (data: Partial<T>) => Promise<T | null>
  update: (id: string | number, data: Partial<T>) => Promise<T | null>
  remove: (id: string | number) => Promise<boolean>
  search: (query: string) => Promise<void>
  setSelectedItem: (item: T | null) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  refresh: () => Promise<void>
}

export function useCRUD<T extends { id: string | number }>({
  service,
  entityName,
  onSuccess,
  onError,
  autoFetch = true,
  paginated = true
}: UseCRUDOptions<T>): UseCRUDReturn<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  // Buscar dados
  const fetchData = useCallback(async (params?: any) => {
    setLoading(true)
    setError(null)
    
    try {
      if (paginated) {
        const response = await service.getPaginated({
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          search: searchQuery,
          ...params
        })
        
        setData(response.data)
        setPagination(prev => ({
          ...prev,
          total: response.total,
          totalPages: response.totalPages
        }))
      } else {
        const response = await service.getAll(params)
        setData(response)
        setPagination(prev => ({
          ...prev,
          total: response.length,
          totalPages: 1
        }))
      }
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      onError?.('fetch', err)
    } finally {
      setLoading(false)
    }
  }, [service, entityName, pagination.currentPage, pagination.pageSize, searchQuery, paginated, onError])

  // Criar novo item
  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const newItem = await service.create(data)
      onSuccess?.('create', newItem)
      await fetchData()
      return newItem
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      onError?.('create', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [service, entityName, onSuccess, onError, fetchData])

  // Atualizar item
  const update = useCallback(async (id: string | number, data: Partial<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedItem = await service.update(id, data)
      onSuccess?.('update', updatedItem)
      await fetchData()
      return updatedItem
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      onError?.('update', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [service, entityName, onSuccess, onError, fetchData])

  // Remover item
  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      await service.delete(id)
      onSuccess?.('delete')
      await fetchData()
      return true
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      onError?.('delete', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [service, entityName, onSuccess, onError, fetchData])

  // Buscar
  const search = useCallback(async (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }, [])

  // Mudar página
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }, [])

  // Mudar tamanho da página
  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize: size,
      currentPage: 1 
    }))
  }, [])

  // Atualizar dados
  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Buscar dados automaticamente
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [pagination.currentPage, pagination.pageSize, searchQuery])

  return {
    data,
    loading,
    error,
    selectedItem,
    pagination,
    fetchData,
    create,
    update,
    remove,
    search,
    setSelectedItem,
    setPage,
    setPageSize,
    refresh
  }
} 