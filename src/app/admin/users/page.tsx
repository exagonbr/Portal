'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { institutionService } from '@/services/institutionService'
import { UserResponseDto, UserFilterDto, RoleResponseDto, InstitutionResponseDto } from '@/types/api'
import { UserDto, RoleDto, InstitutionDto, UserFilter } from '@/types/user'
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
  Calendar
} from 'lucide-react'

// Interface para estatísticas de usuários
interface UserStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  usersByRole: Record<string, number>
}

export default function AdminUsersPage() {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  
  // Dados principais
  const [users, setUsers] = useState<UserDto[]>([])
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([])

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<UserFilter>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Modais
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

  // Estatísticas
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    usersByRole: {},
  })

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

  const calculateStats = useCallback((allUsers: UserDto[], allRoles: RoleDto[]) => {
    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter(u => u.is_active).length
    const inactiveUsers = totalUsers - activeUsers
    
    const usersByRole = allUsers.reduce((acc, user) => {
      const role = allRoles.find(r => r.id === user.role_id)
      const roleName = role?.name || 'Sem Função'
      acc[roleName] = (acc[roleName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({ totalUsers, activeUsers, inactiveUsers, usersByRole })
  }, [])

  const fetchPageData = useCallback(async (page = 1, search = '', currentFilters: UserFilter = {}, showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    try {
      // Carregar dados auxiliares (roles, institutions) uma vez
      if (roles.length === 0) {
        try {
          const [rolesResponse, institutionsResponse] = await Promise.all([
            roleService.getRoles({ limit: 1000 }),
            institutionService.getInstitutions({ limit: 1000 })
          ]);
          setRoles(rolesResponse.items);
          setInstitutions(institutionsResponse.items);
        } catch (error: any) {
          console.error('❌ Erro ao carregar roles/instituições:', error)
          // Verificar se é um erro de autenticação
          if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
            return handleAuthError()
          }
          throw error
        }
      }

      const params: UserFilter = {
        page,
        limit: itemsPerPage,
        sortBy: 'name',
        sortOrder: 'asc',
        search: search,
        ...currentFilters,
      }

      try {
        const response = await userService.getUsers(params)
        setUsers(response.items || [])
        setTotalItems(response.total || 0)
        setCurrentPage(page)

        // Calcular stats com todos os usuários para uma visão geral
        const allUsersResponse = await userService.getUsers({ limit: 1000 });
        const allRolesResponse = await roleService.getRoles({ limit: 1000 });
        calculateStats(allUsersResponse.items, allRolesResponse.items);

        if (!showLoadingIndicator) {
          showSuccess("Lista de usuários atualizada!")
        }
      } catch (error: any) {
        console.error('❌ Erro ao carregar usuários:', error)
        // Verificar se é um erro de autenticação
        if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
          return handleAuthError()
        }
        throw error
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      showError("Erro ao carregar usuários.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [itemsPerPage, calculateStats, roles.length, showSuccess, showError, handleAuthError])

  useEffect(() => {
    fetchPageData(currentPage, searchQuery, filters)
  }, [currentPage, fetchPageData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPageData(1, searchQuery, filters)
  }

  const handleFilterChange = (key: keyof UserFilter, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined || value === null) {
      delete (newFilters as any)[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchPageData(1, searchQuery, filters);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setCurrentPage(1);
    fetchPageData(1, '', {});
  };

  const handleRefresh = () => {
    fetchPageData(currentPage, searchQuery, filters, false)
  }

  const handleDeleteUser = async (user: UserDto) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) return

    try {
      setLoading(true)
      await userService.deleteUser(Number(user.id))
      showSuccess("Usuário excluído com sucesso.")
      await fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error: any) {
      console.error('❌ Erro ao excluir usuário:', error)
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        handleAuthError()
        return
      }
      showError("Erro ao excluir usuário.")
    } finally {
      setLoading(false)
    }
  }

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
    await fetchPageData(currentPage, searchQuery, filters, false)
  }

  const getRoleName = (roleId?: string) => roles.find(r => r.id === roleId)?.name || 'N/A'
  const getInstitutionName = (instId?: string | null) => institutions.find(i => i.id === instId)?.name || 'N/A'

  const totalPages = Math.ceil(totalItems / itemsPerPage)

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
                <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Usuário
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <StatCard icon={Users} title="Total" value={stats.totalUsers} subtitle="Usuários" color="blue" />
              <StatCard icon={UserCheck} title="Ativos" value={stats.activeUsers} subtitle="Contas ativas" color="green" />
              <StatCard icon={UserX} title="Inativos" value={stats.inactiveUsers} subtitle="Contas inativas" color="red" />
            </div>

            {/* Search & Filter Trigger */}
            <div className="flex gap-3">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
              <Button onClick={() => setShowFilterPanel(!showFilterPanel)} variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Função</label>
                  <select
                    value={filters.role_id || ''}
                    onChange={(e) => handleFilterChange('role_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todas as Funções</option>
                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                  <select
                    value={filters.is_active === undefined ? '' : String(filters.is_active)}
                    onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos</option>
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={clearFilters}>Limpar Filtros</Button>
                <Button onClick={applyFilters}>Aplicar</Button>
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando usuários...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhum usuário encontrado</p>
                <p className="text-gray-400 text-sm">{searchQuery || Object.keys(filters).length > 0 ? "Tente ajustar sua busca ou filtros." : "Clique em \"Novo Usuário\" para adicionar o primeiro"}</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instituição</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">{user.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{getRoleName(user.role_id)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{getInstitutionName(user.institution_id)}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={user.is_active ? 'success' : 'danger'}>
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => openModal('edit', user)} className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Ativo' : 'Inativo'}</Badge>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center text-sm"><Shield className="w-4 h-4 mr-2 text-gray-400"/>{getRoleName(user.role_id)}</div>
                        <div className="flex items-center text-sm"><Building2 className="w-4 h-4 mr-2 text-gray-400"/>{getInstitutionName(user.institution_id)}</div>
                      </div>
                      <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openModal('edit', user)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)}>Excluir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</Button>
              </div>
            </div>
          )}
        </div>

        <UserFormModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSuccess={handleModalSave}
          user={selectedUser ? mapToUserResponseDto(selectedUser) : null}
          roles={roles as unknown as RoleResponseDto[]}
          institutions={institutions as unknown as InstitutionResponseDto[]}
        />
      </div>
  )
}
