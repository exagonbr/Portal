import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { RoleResponseDto, InstitutionResponseDto } from '@/types/api'
import { useToast } from '@/components/ToastManager'

interface UseUsersOptions {
  initialPageSize?: number
}

interface UseUsersReturn {
  // Data
  roles: RoleResponseDto[]
  institutions: InstitutionResponseDto[]
  
  // Loading states
  loading: boolean
  rolesLoading: boolean
  institutionsLoading: boolean
  auxiliaryDataLoaded: boolean
  
  // Pagination
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  
  // Filters and search
  searchTerm: string
  filters: UsersFilterDto
  sortBy: 'name' | 'fullName' | 'email' | 'dateCreated' | 'lastUpdated'
  sortOrder: 'asc' | 'desc'
  
  // Error handling
  auxiliaryDataError: string | null
  
  // Actions
  loadUsers: () => Promise<void>
  loadAuxiliaryData: () => Promise<void>
  refreshUsers: () => Promise<void>
  setCurrentPage: (page: number) => void
  setItemsPerPage: (size: number) => void
  setSearchTerm: (term: string) => void
  setFilters: (filters: UsersFilterDto) => void
  setSortBy: (sortBy: 'name' | 'fullName' | 'email' | 'dateCreated' | 'lastUpdated') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  clearFilters: () => void
  hasActiveFilters: () => boolean
  
  // CRUD operations
  createUser: (userData: any) => Promise<void>
  updateUser: (id: number, userData: any) => Promise<void>
  deleteUser: (id: number) => Promise<void>
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const { initialPageSize = 10 } = options
  const { showSuccess, showError } = useToast()
  const isMountedRef = useRef(true)
  const loadingRef = useRef(false) // Prevent concurrent loads

  // Data state
  const [users, setUsers] = useState<UsersResponseDto[]>([])
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([])

  // Loading states
  const [loading, setLoading] = useState(true)
  const [rolesLoading, setRolesLoading] = useState(true)
  const [institutionsLoading, setInstitutionsLoading] = useState(true)
  const [auxiliaryDataLoaded, setAuxiliaryDataLoaded] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize)

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<UsersFilterDto>({})
  const [sortBy, setSortBy] = useState<'name' | 'fullName' | 'email' | 'dateCreated' | 'lastUpdated'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Error state
  const [auxiliaryDataError, setAuxiliaryDataError] = useState<string | null>(null)

  // FIXED: Use stable references for filters to prevent re-renders
  const filtersRef = useRef<UsersFilterDto>({})
  const paramsRef = useRef<any>({})

  // Update refs when state changes but don't trigger re-renders
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Memoize params with stable reference
  const memoizedParams = useMemo(() => {
    const newParams = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder,
      ...filtersRef.current,
    }
    
    // Only update if actually changed
    if (JSON.stringify(newParams) !== JSON.stringify(paramsRef.current)) {
      paramsRef.current = newParams
    }
    
    return paramsRef.current
  }, [currentPage, itemsPerPage, sortBy, sortOrder])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Load auxiliary data (roles and institutions) - FIXED: Remove from dependencies to prevent loops
  const loadAuxiliaryData = useCallback(async () => {
    if (auxiliaryDataLoaded || loadingRef.current) return // Prevent repeated fetches
    
    loadingRef.current = true
    setRolesLoading(true)
    setInstitutionsLoading(true)
    setAuxiliaryDataError(null)

    try {
      console.log('🔄 Carregando dados auxiliares (roles e instituições)...')

      // Load roles and institutions in parallel
      const [rolesResult, institutionsResult] = await Promise.allSettled([
        roleService.getActiveRoles(),
        institutionService.getActiveInstitutions()
      ])

      // Handle roles
      if (rolesResult.status === 'fulfilled') {
        console.log('✅ Roles carregadas:', rolesResult.value.length)
        if (isMountedRef.current) {
          setRoles(rolesResult.value)
        }
      } else {
        console.log('❌ Erro ao carregar roles:', rolesResult.reason)
        setAuxiliaryDataError('Falha ao carregar funções.')
        if (isMountedRef.current) {
          setRoles([])
        }
      }

      // Handle institutions
      if (institutionsResult.status === 'fulfilled') {
        console.log('✅ Instituições carregadas:', institutionsResult.value.length)
        if (isMountedRef.current) {
          setInstitutions(institutionsResult.value)
        }
      } else {
        console.log('❌ Erro ao carregar instituições:', institutionsResult.reason)
        setAuxiliaryDataError(prev => 
          prev ? `${prev} Falha ao carregar instituições.` : 'Falha ao carregar instituições.'
        )
        if (isMountedRef.current) {
          setInstitutions([])
        }
      }
    } finally {
      if (isMountedRef.current) {
        setRolesLoading(false)
        setInstitutionsLoading(false)
        setAuxiliaryDataLoaded(true)
      }
      loadingRef.current = false
    }
  }, [auxiliaryDataLoaded]) // FIXED: Only depend on auxiliaryDataLoaded

  // FIXED: Load users with stable dependencies
  const loadUsers = useCallback(async (showLoadingIndicator = true) => {
    if (!isMountedRef.current || loadingRef.current) return

    loadingRef.current = true
    if (showLoadingIndicator) setLoading(true)

    try {
      console.log('🔍 [useUsers] Buscando usuários com parâmetros:', memoizedParams)

      const response = searchTerm
        ? await usersService.searchUsers(searchTerm, memoizedParams)
        : await usersService.getUsers(memoizedParams)

      if (!response || !response.items || !Array.isArray(response.items)) {
        console.log('❌ [useUsers] Resposta inválida do usersService:', response)
        throw new Error('Formato de resposta inválido do servidor')
      }

      console.log('📥 [useUsers] Resposta recebida:', {
        totalItems: response.items.length,
        pagination: response.pagination,
        primeiroUsuario: response.items[0]?.name || response.items[0]?.fullName,
        ultimoUsuario: response.items[response.items.length - 1]?.name || response.items[response.items.length - 1]?.fullName
      })

      // Enrich users with role and institution names
      const enrichedUsers = response.items.map(user => {
        const role = roles.find(r => r.id === (user.roleId || user.role_id))
        const institution = institutions.find(i => i.id === String(user.institutionId || user.institution_id))
        
        return {
          ...user,
          role_name: user.role_name || role?.name || 'Não definida',
          institution_name: user.institution_name || institution?.name || 'Não vinculada',
        }
      })

      if (isMountedRef.current) {
        setUsers(enrichedUsers)
        setTotalPages(response.pagination.totalPages)
        setTotalItems(response.pagination.total)
      }

      console.log(`✅ [useUsers] ${enrichedUsers.length} usuários carregados com sucesso`)
    } catch (error: any) {
      console.log('❌ [useUsers] Erro ao carregar usuários:', error)
      showError(error.message || 'Erro ao carregar usuários')
      
      if (isMountedRef.current) {
        setUsers([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
      loadingRef.current = false
    }
  }, [memoizedParams, searchTerm, roles, institutions, showError]) // FIXED: Stable dependencies

  // Refresh users (force reload)
  const refreshUsers = useCallback(async () => {
    await loadUsers(false)
  }, [loadUsers])

  // Helper functions
  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    setSortBy('name')
    setSortOrder('asc')
  }, [])

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).length > 0 || searchTerm.length > 0
  }, [filters, searchTerm])

  // CRUD operations
  const createUser = useCallback(async (userData: any) => {
    try {
      await usersService.createUser(userData)
      showSuccess('Usuário criado com sucesso!')
      await loadUsers()
    } catch (error: any) {
      console.log('Erro ao criar usuário:', error)
      throw error
    }
  }, [loadUsers, showSuccess])

  const updateUser = useCallback(async (id: number, userData: any) => {
    try {
      await usersService.updateUser(id, userData)
      showSuccess('Usuário atualizado com sucesso!')
      await loadUsers()
    } catch (error: any) {
      console.log('Erro ao atualizar usuário:', error)
      throw error
    }
  }, [loadUsers, showSuccess])

  const deleteUser = useCallback(async (id: number) => {
    try {
      await usersService.deleteUser(id)
      showSuccess('Usuário excluído com sucesso!')
      await loadUsers()
    } catch (error: any) {
      console.log('Erro ao excluir usuário:', error)
      throw error
    }
  }, [loadUsers, showSuccess])

  // Enhanced setters that trigger reload
  const setCurrentPageAndReload = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const setItemsPerPageAndReload = useCallback((size: number) => {
    setItemsPerPage(size)
    setCurrentPage(1) // Reset to first page
  }, [])

  const setFiltersAndReload = useCallback((newFilters: UsersFilterDto) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const setSearchTermAndReload = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when search changes
  }, [])

  // FIXED: Load auxiliary data on mount only once
  useEffect(() => {
    if (!auxiliaryDataLoaded) {
      loadAuxiliaryData()
    }
  }, []) // Empty dependency array - run only once

  // FIXED: Load users when auxiliary data is ready or key dependencies change
  useEffect(() => {
    if (auxiliaryDataLoaded && !loadingRef.current) {
      const timeoutId = setTimeout(() => {
        loadUsers()
      }, 100) // Small delay to prevent rapid calls
      
      return () => clearTimeout(timeoutId)
    }
  }, [auxiliaryDataLoaded, memoizedParams, searchTerm]) // FIXED: Stable dependencies

  return {
    // Data
    users,
    roles,
    institutions,
    
    // Loading states
    loading,
    rolesLoading,
    institutionsLoading,
    auxiliaryDataLoaded,
    
    // Pagination
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    
    // Filters and search
    searchTerm,
    filters,
    sortBy,
    sortOrder,
    
    // Error handling
    auxiliaryDataError,
    
    // Actions
    loadUsers,
    loadAuxiliaryData,
    refreshUsers,
    setCurrentPage: setCurrentPageAndReload,
    setItemsPerPage: setItemsPerPageAndReload,
    setSearchTerm: setSearchTermAndReload,
    setFilters: setFiltersAndReload,
    setSortBy,
    setSortOrder,
    clearFilters,
    hasActiveFilters,
    
    // CRUD operations
    createUser,
    updateUser,
    deleteUser,
  }
}
