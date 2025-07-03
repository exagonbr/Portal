import { useState, useEffect, useCallback, useRef } from 'react'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { institutionService } from '@/services/institutionService'
import { UserResponseDto, UserFilterDto, RoleResponseDto, InstitutionResponseDto } from '@/types/api'
import { useToast } from '@/components/ToastManager'

interface UseUsersOptions {
  initialPageSize?: number
}

interface UseUsersReturn {
  // Data
  users: UserResponseDto[]
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
  filters: UserFilterDto
  sortBy: 'name' | 'email' | 'created_at'
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
  setFilters: (filters: UserFilterDto) => void
  setSortBy: (sortBy: 'name' | 'email' | 'created_at') => void
  setSortOrder: (order: 'asc' | 'desc') => void
  clearFilters: () => void
  hasActiveFilters: () => boolean
  
  // CRUD operations
  createUser: (userData: any) => Promise<void>
  updateUser: (id: string, userData: any) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const { initialPageSize = 10 } = options
  const { showSuccess, showError } = useToast()
  const isMountedRef = useRef(true)

  // Data state
  const [users, setUsers] = useState<UserResponseDto[]>([])
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
  const [filters, setFilters] = useState<UserFilterDto>({})
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Error state
  const [auxiliaryDataError, setAuxiliaryDataError] = useState<string | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Load auxiliary data (roles and institutions)
  const loadAuxiliaryData = useCallback(async () => {
    setRolesLoading(true)
    setInstitutionsLoading(true)
    setAuxiliaryDataError(null)

    try {
      console.log('🔄 Carregando dados auxiliares (roles e instituições)...')

      // Load roles
      try {
        const rolesFromApi = await roleService.getActiveRoles()
        console.log('✅ Roles carregadas:', rolesFromApi.length)
        if (isMountedRef.current) {
          setRoles(rolesFromApi)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar roles:', error)
        setAuxiliaryDataError('Falha ao carregar funções.')
        if (isMountedRef.current) {
          setRoles([])
        }
      } finally {
        if (isMountedRef.current) {
          setRolesLoading(false)
        }
      }

      // Load institutions
      try {
        const institutionsFromApi = await institutionService.getActiveInstitutions()
        console.log('✅ Instituições carregadas:', institutionsFromApi.length)
        if (isMountedRef.current) {
          setInstitutions(institutionsFromApi)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar instituições:', error)
        setAuxiliaryDataError(prev => 
          prev ? `${prev} Falha ao carregar instituições.` : 'Falha ao carregar instituições.'
        )
        if (isMountedRef.current) {
          setInstitutions([])
        }
      } finally {
        if (isMountedRef.current) {
          setInstitutionsLoading(false)
        }
      }
    } finally {
      if (isMountedRef.current) {
        setAuxiliaryDataLoaded(true)
      }
    }
  }, [])

  // Load users with current filters and pagination
  const loadUsers = useCallback(async (showLoadingIndicator = true) => {
    if (!isMountedRef.current) return

    if (showLoadingIndicator) setLoading(true)

    try {
      const params: UserFilterDto = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        ...filters,
      }

      console.log('🔍 Buscando usuários com parâmetros:', params)

      const response = searchTerm
        ? await userService.searchUsers(searchTerm, params)
        : await userService.getUsers(params)

      if (!response || !response.items || !Array.isArray(response.items)) {
        console.error('❌ Resposta inválida do userService:', response)
        throw new Error('Formato de resposta inválido do servidor')
      }

      // Enrich users with role and institution names
      const enrichedUsers = response.items.map(user => {
        const role = roles.find(r => r.id === user.role_id)
        const institution = institutions.find(i => i.id === user.institution_id)
        
        return {
          ...user,
          role_name: role?.name || 'Não definida',
          institution_name: institution?.name || 'Não vinculada',
        }
      })

      if (isMountedRef.current) {
        setUsers(enrichedUsers)
        setTotalPages(response.pagination.totalPages)
        setTotalItems(response.pagination.total)
      }

      console.log(`✅ ${enrichedUsers.length} usuários carregados com sucesso`)
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error)
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
    }
  }, [currentPage, itemsPerPage, sortBy, sortOrder, filters, searchTerm, roles, institutions, showError])

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
      await userService.createUser(userData)
      showSuccess('Usuário criado com sucesso!')
      await loadUsers()
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)
      throw error
    }
  }, [loadUsers, showSuccess])

  const updateUser = useCallback(async (id: string, userData: any) => {
    try {
      await userService.updateUser(id, userData)
      showSuccess('Usuário atualizado com sucesso!')
      await loadUsers()
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error)
      throw error
    }
  }, [loadUsers, showSuccess])

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.deleteUser(id)
      showSuccess('Usuário excluído com sucesso!')
      await loadUsers()
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
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

  const setFiltersAndReload = useCallback((newFilters: UserFilterDto) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  const setSearchTermAndReload = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when search changes
  }, [])

  // Load auxiliary data on mount
  useEffect(() => {
    loadAuxiliaryData()
  }, [loadAuxiliaryData])

  // Load users when auxiliary data is ready or dependencies change
  useEffect(() => {
    if (auxiliaryDataLoaded && isMountedRef.current) {
      loadUsers()
    }
  }, [loadUsers, auxiliaryDataLoaded])

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
