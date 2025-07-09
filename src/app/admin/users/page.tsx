'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { institutionService } from '@/services/institutionService'
import { RoleResponseDto, InstitutionResponseDto, UserResponseDto } from '@/types/api'
import { UserDto, UserFilter } from '@/types/user'
import { RoleDto } from '@/types/roles'
import { InstitutionDto } from '@/types/institution'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import UserFormModal from '@/components/admin/users/UserFormModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StandardCard'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  UserCheck,
  UserX,
  Shield,
  RefreshCw,
  Filter,
  X,
  Mail,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react'

// Interface para estatísticas de usuários
interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: Record<string, number>
}

// Estado da aplicação
interface AppState {
  users: UserDto[]
  roles: RoleDto[]
  institutions: InstitutionDto[]
  stats: UserStats
  pagination: {
    currentPage: number
    totalItems: number
    totalPages: number
    itemsPerPage: number
  }
  filters: UserFilter
  searchQuery: string
  loading: boolean
  refreshing: boolean
  error: string | null
  showFilterPanel: boolean
}

const initialState: AppState = {
  users: [],
  roles: [],
  institutions: [],
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersByRole: {},
  },
  pagination: {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    itemsPerPage: 10
  },
  filters: {},
  searchQuery: '',
  loading: true,
  refreshing: false,
  error: null,
  showFilterPanel: false
}

export default function AdminUsersPage() {
  const { showSuccess, showError, showWarning } = useToast()
  const router = useRouter()
  
  // Estado principal
  const [state, setState] = useState<AppState>(initialState)
  
  // Estado do modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

  // Função para atualizar o estado
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Função para lidar com erros de autenticação
  const handleAuthError = useCallback(() => {
    showError("Sessão expirada. Por favor, faça login novamente.")
    
    // Limpar tokens inválidos
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
    
    // Redirecionar para a página de login
    setTimeout(() => {
      router.push('/auth/login?auth_error=expired')
    }, 1000)
  }, [showError, router])

  // Calcular estatísticas
  const calculateStats = useCallback((users: UserDto[], roles: RoleDto[]): UserStats => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.is_active).length
    const inactiveUsers = totalUsers - activeUsers
    
    const usersByRole = users.reduce((acc, user) => {
      const role = roles.find(r => r.id === user.role_id)
      const roleName = role?.name || 'Sem Função'
      acc[roleName] = (acc[roleName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { totalUsers, activeUsers, inactiveUsers, usersByRole }
  }, [])

  // Carregar dados auxiliares (roles e instituições)
  const loadAuxiliaryData = useCallback(async () => {
    try {
      console.log('🔄 [USERS] Carregando dados auxiliares...')
      
      const [rolesResponse, institutionsResponse] = await Promise.all([
        roleService.getRoles({ limit: 1000 }),
        institutionService.getInstitutions({ limit: 1000 })
      ])
      
      console.log('✅ [USERS] Dados auxiliares carregados:', {
        roles: rolesResponse?.items?.length || 0,
        institutions: Array.isArray(institutionsResponse) 
          ? institutionsResponse.length 
          : (institutionsResponse as any)?.items?.length || 0
      })
      
      const rolesData = rolesResponse.items || []
      const institutionsData = Array.isArray(institutionsResponse) 
        ? institutionsResponse 
        : (institutionsResponse as any).items || []
      

      
      updateState({
        roles: rolesData,
        institutions: institutionsData
      })
      
      return {
        roles: rolesResponse.items || [],
        institutions: (institutionsResponse as any).items || institutionsResponse || []
      }
    } catch (error: any) {
      console.error('❌ [USERS] Erro ao carregar dados auxiliares:', error)
      
      // Verificar se é erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        handleAuthError()
        return null
      }
      
      // Continuar sem dados auxiliares
      showWarning("Alguns dados auxiliares não puderam ser carregados.")
      return { roles: [], institutions: [] }
    }
  }, [updateState, handleAuthError, showWarning])

  // Carregar usuários
  const loadUsers = useCallback(async (page = 1, search = '', filters: UserFilter = {}, showLoading = true) => {
    try {
      if (showLoading) {
        updateState({ loading: true, error: null })
      } else {
        updateState({ refreshing: true, error: null })
      }

      const params: UserFilter = {
        page,
        limit: state.pagination.itemsPerPage,
        sortBy: 'name',
        sortOrder: 'asc',
        search: search || undefined,
        ...filters,
      }

      console.log('🔄 [USERS] Carregando usuários com parâmetros:', params)
      
      const response = await userService.getUsers(params)
      
      console.log('✅ [USERS] Usuários carregados:', {
        items: response.items?.length || 0,
        total: response.total,
        page: response.page
      })
      

      
      // Verificar se a resposta tem o formato esperado
      if (!response || !Array.isArray(response.items)) {
        throw new Error('Formato de resposta inválido do servidor')
      }
      
      updateState({
        users: response.items,
        pagination: {
          ...state.pagination,
          currentPage: page,
          totalItems: response.total || 0,
          totalPages: response.totalPages || Math.ceil((response.total || 0) / state.pagination.itemsPerPage)
        },
        searchQuery: search,
        filters: filters,
        loading: false,
        refreshing: false,
        error: null
      })

      // Calcular estatísticas
      if (state.roles && Array.isArray(state.roles) && state.roles.length > 0) {
        const stats = calculateStats(response.items, state.roles)
        updateState({ stats })
      }

      if (!showLoading) {
        showSuccess("Lista de usuários atualizada com sucesso!")
      }
      
    } catch (error: any) {
      console.error('❌ [USERS] Erro ao carregar usuários:', error)
      
      // Verificar se é erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        handleAuthError()
        return
      }
      
      const errorMessage = error.message || "Erro ao carregar usuários. Verifique sua conexão e tente novamente."
      
      updateState({
        loading: false,
        refreshing: false,
        error: errorMessage,
        users: [],
        pagination: { ...state.pagination, totalItems: 0, totalPages: 0 }
      })
      
      showError(errorMessage)
    }
  }, [updateState, calculateStats, handleAuthError, showSuccess, showError])

  // Inicialização
  useEffect(() => {
    const initialize = async () => {
      console.log('🚀 [USERS] Inicializando página de usuários...')
      
      // Carregar dados auxiliares primeiro
      const auxiliaryData = await loadAuxiliaryData()
      if (!auxiliaryData) return // Se falhar por autenticação, parar aqui
      
      // Carregar usuários
      await loadUsers()
    }
    
    initialize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handlers de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadUsers(1, state.searchQuery, state.filters)
  }

  const handleFilterChange = (key: keyof UserFilter, value: any) => {
    const newFilters = { ...state.filters }
    if (value === '' || value === undefined || value === null) {
      delete (newFilters as any)[key]
    } else {
      (newFilters as any)[key] = value
    }
    updateState({ filters: newFilters })
  }

  const applyFilters = () => {
    loadUsers(1, state.searchQuery, state.filters)
  }

  const clearFilters = () => {
    updateState({ 
      searchQuery: '', 
      filters: {},
      showFilterPanel: false 
    })
    loadUsers(1, '', {})
  }

  const handleRefresh = () => {
    loadUsers(state.pagination.currentPage, state.searchQuery, state.filters, false)
  }

  const handlePageChange = (page: number) => {
    loadUsers(page, state.searchQuery, state.filters)
  }

  const handleDeleteUser = async (user: UserDto) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) return

    try {
      updateState({ loading: true })
      await userService.deleteUser(Number(user.id))
      showSuccess("Usuário excluído com sucesso.")
      await loadUsers(state.pagination.currentPage, state.searchQuery, state.filters, false)
    } catch (error: any) {
      console.error('❌ Erro ao excluir usuário:', error)
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        handleAuthError()
        return
      }
      showError("Erro ao excluir usuário.")
      updateState({ loading: false })
    }
  }

  // Handlers do modal
  const openModal = (mode: 'create' | 'edit', user?: UserDto) => {
    setModalMode(mode)
    setSelectedUser(user || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedUser(null)
  }

  const handleModalSave = async () => {
    closeModal()
    await loadUsers(state.pagination.currentPage, state.searchQuery, state.filters, false)
  }

  // Helpers
  const getRoleName = (roleId?: string) => {
    if (!roleId) return 'N/A'
    // Comparar tanto como string quanto como número para flexibilidade
    return state.roles.find(r => r.id === roleId || String(r.id) === String(roleId))?.name || 'N/A'
  }
  
  const getInstitutionName = (instId?: string | null) => {
    if (!instId) return 'N/A'
    // Comparar tanto como string quanto como número para flexibilidade
    return state.institutions.find(i => i.id === instId || String(i.id) === String(instId))?.name || 'N/A'
  }

  // Converter UserDto para UserResponseDto para compatibilidade com o UserFormModal
  const mapToUserResponseDto = (user: UserDto): UserResponseDto => ({
    id: Number(user.id),
    full_name: user.name,
    email: user.email,
    enabled: user.is_active,
    role_id: user.role_id,
    institution_id: user.institution_id,
    is_admin: false,
    is_manager: false,
    is_student: false,
    is_teacher: false,
    phone: user.phone,
    address: user.address,
  })

  return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                <p className="text-gray-600 mt-1">Administre usuários, permissões e grupos do sistema</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  disabled={state.refreshing || state.loading} 
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${state.refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button 
                  onClick={() => openModal('create')} 
                  disabled={state.loading}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Usuário
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <StatCard 
                icon={Users} 
                title="Total" 
                value={state.stats.totalUsers} 
                subtitle="Usuários" 
                color="blue" 
              />
              <StatCard 
                icon={UserCheck} 
                title="Ativos" 
                value={state.stats.activeUsers} 
                subtitle="Contas ativas" 
                color="green" 
              />
              <StatCard 
                icon={UserX} 
                title="Inativos" 
                value={state.stats.inactiveUsers} 
                subtitle="Contas inativas" 
                color="red" 
              />
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={state.searchQuery}
                    onChange={(e) => updateState({ searchQuery: e.target.value })}
                    disabled={state.loading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </form>
              <Button 
                onClick={() => updateState({ showFilterPanel: !state.showFilterPanel })} 
                variant="outline" 
                disabled={state.loading}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {state.showFilterPanel && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Função</label>
                  <select
                    value={state.filters.role_id || ''}
                    onChange={(e) => handleFilterChange('role_id', e.target.value)}
                    disabled={state.loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  >
                    <option value="">Todas as Funções</option>
                    {state.roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                  <select
                    value={state.filters.is_active === undefined ? '' : String(state.filters.is_active)}
                    onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                    disabled={state.loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  >
                    <option value="">Todos</option>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Instituição</label>
                  <select
                    value={state.filters.institution_id || ''}
                    onChange={(e) => handleFilterChange('institution_id', e.target.value)}
                    disabled={state.loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                  >
                    <option value="">Todas as Instituições</option>
                    {state.institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={clearFilters} disabled={state.loading}>
                  Limpar Filtros
                </Button>
                <Button onClick={applyFilters} disabled={state.loading}>
                  Aplicar
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            {state.error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <p className="text-red-600 text-lg mb-2">Erro ao carregar dados</p>
                  <p className="text-red-400 text-sm mb-4">{state.error}</p>
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : state.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando usuários...</span>
              </div>
            ) : state.users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhum usuário encontrado</p>
                <p className="text-gray-400 text-sm">
                  {state.searchQuery || Object.keys(state.filters).length > 0 
                    ? "Tente ajustar sua busca ou filtros." 
                    : "Clique em \"Novo Usuário\" para adicionar o primeiro"
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instituição
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {state.users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {user.name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name || 'Nome não informado'}
                                </div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {getRoleName(user.role_id)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {getInstitutionName(user.institution_id)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={user.is_active ? 'success' : 'danger'}>
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openModal('edit', user)} 
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteUser(user)} 
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {state.users.map(user => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {user.name || 'Nome não informado'}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant={user.is_active ? 'success' : 'danger'}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <Shield className="w-4 h-4 mr-2 text-gray-400"/>
                          {getRoleName(user.role_id)}
                        </div>
                        <div className="flex items-center text-sm">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400"/>
                          {getInstitutionName(user.institution_id)}
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openModal('edit', user)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)}>
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {state.pagination.totalPages > 1 && !state.loading && !state.error && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {state.pagination.currentPage} de {state.pagination.totalPages} 
                ({state.pagination.totalItems} usuários)
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(state.pagination.currentPage - 1)} 
                  disabled={state.pagination.currentPage === 1 || state.loading}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePageChange(state.pagination.currentPage + 1)} 
                  disabled={state.pagination.currentPage === state.pagination.totalPages || state.loading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>

        <UserFormModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSuccess={handleModalSave}
          user={selectedUser ? mapToUserResponseDto(selectedUser) : null}
          roles={state.roles as unknown as RoleResponseDto[]}
          institutions={state.institutions as unknown as InstitutionResponseDto[]}
        />
      </div>
  )
}
