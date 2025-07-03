'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ToastManager'
import { usersService, UsersResponseDto, UsersFilterDto } from '@/services/usersService'
import { roleService } from '@/services/roleService'
import { institutionService } from '@/services/institutionService'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import GenericCRUD, { CRUDColumn, CRUDAction } from '@/components/crud/GenericCRUD'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import UserFormModal from '@/components/admin/users/UserFormModal'
import UserPermissionsModal from '@/components/admin/users/UserPermissionsModal'
import UserViewModal from '@/components/admin/users/UserViewModal'
import { RoleResponseDto, InstitutionResponseDto } from '@/types/api'
import { formatDate } from '@/utils/date'
import {
  Plus,
  Eye,
  Edit,
  Shield,
  Mail,
  Building2,
  Calendar,
  Filter,
  RefreshCw,
  CheckCircle,
  X
} from 'lucide-react'

// Constantes
const ITEMS_PER_PAGE = 10
const DEBOUNCE_DELAY = 300
const ALLOWED_ROLES = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'admin']

// Tipos
interface ModalState {
  create: boolean
  edit: boolean
  view: boolean
  permissions: boolean
}

interface LoadingState {
  users: boolean
  auxiliaryData: boolean
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  
  // Ref para controlar se o componente está montado
  const isMountedRef = useRef(true)
  
  // Estados principais
  const [users, setUsers] = useState<UsersResponseDto[]>([])
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<UsersFilterDto>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UsersResponseDto | null>(null)
  const [auxiliaryDataError, setAuxiliaryDataError] = useState<string | null>(null)

  // Estados de loading
  const [loading, setLoading] = useState<LoadingState>({
    users: true,
    auxiliaryData: true
  })

  // Estados dos modais
  const [modals, setModals] = useState<ModalState>({
    create: false,
    edit: false,
    view: false,
    permissions: false
  })

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Utilitários
  const canCreateUsers = useCallback(() => {
    if (!user) return false
    return ALLOWED_ROLES.includes(user.role?.toUpperCase() || '')
  }, [user])

  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).length > 0 &&
      Object.values(filters).some(value =>
        value !== undefined && value !== '' &&
        (typeof value !== 'object' || Object.keys(value).length > 0)
      )
  }, [filters])

  const getRoleBadgeVariant = (roleName: string) => {
    const normalizedRole = roleName?.toUpperCase()
    switch (normalizedRole) {
      case 'SYSTEM_ADMIN':
      case 'ADMIN':
        return 'danger'
      case 'TEACHER':
      case 'PROFESSOR':
        return 'warning'
      case 'STUDENT':
        return 'info'
      case 'COORDINATOR':
      case 'ACADEMIC_COORDINATOR':
        return 'success'
      case 'INSTITUTION_MANAGER':
      case 'MANAGER':
        return 'primary'
      case 'GUARDIAN':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  // Função para obter mensagem de erro específica
  const getErrorMessage = (error: any): string => {
    if (!error.message) return 'Erro ao carregar usuários'
    
    if (error.message.includes('Network')) {
      return 'Erro de conexão com o servidor. Verifique se o backend está rodando.'
    }
    if (error.message.includes('401') || error.message.includes('403')) {
      return 'Erro de autenticação. Faça login novamente.'
    }
    if (error.message.includes('500')) {
      return 'Erro interno do servidor. Contate o suporte.'
    }
    
    return error.message
  }

  // Carregar dados auxiliares (roles e instituições)
  const loadAuxiliaryData = useCallback(async () => {
    setAuxiliaryDataError(null)
    setLoading(prev => ({ ...prev, auxiliaryData: true }))
    
    try {
      const [rolesResult, institutionsResult] = await Promise.allSettled([
        roleService.getActiveRoles(),
        institutionService.getActiveInstitutions()
      ])

      if (rolesResult.status === 'fulfilled') {
        setRoles(rolesResult.value)
      } else {
        console.error('Erro ao carregar roles:', rolesResult.reason)
        setAuxiliaryDataError('Falha ao carregar funções. Algumas opções podem estar indisponíveis.')
        setRoles([])
      }

      if (institutionsResult.status === 'fulfilled') {
        setInstitutions(institutionsResult.value)
      } else {
        console.error('Erro ao carregar instituições:', institutionsResult.reason)
        setAuxiliaryDataError(prev =>
          prev ? `${prev} Falha ao carregar instituições.` : 'Falha ao carregar instituições. Algumas opções podem estar indisponíveis.'
        )
        setInstitutions([])
      }

    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error)
      setAuxiliaryDataError('Falha ao carregar dados auxiliares. Algumas opções podem estar indisponíveis.')
    } finally {
      setLoading(prev => ({ ...prev, auxiliaryData: false }))
    }
  }, [])

  // Carregar usuários
  const loadUsers = useCallback(async (showLoadingIndicator = true) => {
    if (!isMountedRef.current) return
    
    if (showLoadingIndicator) {
      setLoading(prev => ({ ...prev, users: true }))
    }

    try {
      const params: UsersFilterDto = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortBy: 'name',
        sortOrder: 'asc',
        ...filters,
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      const response = await usersService.getUsers(params)

      if (!isMountedRef.current) return
      
      setUsers(response.items || [])
      setTotalPages(response.pagination?.totalPages || 1)
      setTotalItems(response.pagination?.total || 0)

    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error)
      
      const errorMessage = getErrorMessage(error)
      showError(errorMessage)
      
      if (isMountedRef.current) {
        setUsers([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(prev => ({ ...prev, users: false }))
      }
    }
  }, [currentPage, searchTerm, filters, showError])

  // Função para atualizar lista
  const refreshUsers = useCallback(() => {
    loadUsers(false)
  }, [loadUsers])

  // Handlers de modais
  const openModal = useCallback((modalType: keyof ModalState, user?: UsersResponseDto) => {
    if (modalType === 'create' && !canCreateUsers()) {
      showError('Você não tem permissão para criar usuários.')
      return
    }
    
    if (user) setSelectedUser(user)
    setModals(prev => ({ ...prev, [modalType]: true }))
  }, [canCreateUsers, showError])

  const closeModals = useCallback(() => {
    setSelectedUser(null)
    setModals({
      create: false,
      edit: false,
      view: false,
      permissions: false
    })
  }, [])

  const handleModalSuccess = useCallback(() => {
    closeModals()
    refreshUsers()
  }, [closeModals, refreshUsers])

  // Handlers de ações
  const handleDeleteUser = useCallback(async (userToDelete: UsersResponseDto) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userToDelete.fullName}"?`)) {
      return
    }

    try {
      await usersService.deleteUser(userToDelete.id)
      showSuccess('Usuário excluído com sucesso!')
      refreshUsers()
    } catch (error: any) {
      showError(error.message || 'Erro ao excluir usuário')
    }
  }, [showSuccess, showError, refreshUsers])

  // Funções de filtro
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      if (value === '' || value === undefined || value === null) {
        delete (newFilters as any)[key]
      } else {
        (newFilters as any)[key] = value
      }
      return newFilters
    })
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    showSuccess('Filtros limpos com sucesso')
  }, [showSuccess])

  // Effects
  useEffect(() => {
    loadAuxiliaryData()
  }, [loadAuxiliaryData])

  useEffect(() => {
    if (!loading.auxiliaryData && isMountedRef.current) {
      loadUsers()
    }
  }, [loadUsers, loading.auxiliaryData])

  // Debounced effect para filtros e busca
  useEffect(() => {
    if (loading.auxiliaryData || !isMountedRef.current) return

    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        loadUsers()
      }
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timeoutId)
  }, [currentPage, filters, searchTerm, loading.auxiliaryData, loadUsers])

  // Configuração das colunas da tabela
  const columns: CRUDColumn<UsersResponseDto>[] = [
    {
      key: 'fullName',
      label: 'Usuário',
      sortable: true,
      width: '250px',
      render: (_, user) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-800 truncate">{user.fullName}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Mail className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'roleName',
      label: 'Função',
      sortable: true,
      width: '120px',
      render: (_, user) => {
        const roleName = user.role_name || 'Não definida'
        return (
          <Badge variant={getRoleBadgeVariant(roleName)} className="text-xs">
            {roleName}
          </Badge>
        )
      }
    },
    {
      key: 'institution_name',
      label: 'Instituição',
      width: '150px',
      render: (_, user) => {
        const institutionName = user.institution_name || 'Não vinculada'
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
            <span className="text-slate-700 text-sm truncate" title={institutionName}>
              {institutionName}
            </span>
          </div>
        )
      }
    },
    {
      key: 'enabled',
      label: 'Status',
      width: '90px',
      render: (_, user) => {
        const isActive = user.enabled !== undefined ? user.enabled : user.is_active
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {isActive ? "Ativo" : "Inativo"}
          </div>
        )
      }
    },
    {
      key: 'dateCreated',
      label: 'Cadastro',
      sortable: true,
      width: '110px',
      render: (_, user) => {
        const dateString = user.dateCreated || user.created_at
        const date = new Date(dateString)
        const formattedDate = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        })
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-orange-500 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-700" title={formatDate(dateString)}>
              {formattedDate}
            </span>
          </div>
        )
      }
    }
  ]

  // Ações customizadas para a tabela
  const customActions: CRUDAction<UsersResponseDto>[] = [
    {
      label: 'Ver',
      icon: <Eye className="h-3 w-3" />,
      onClick: (user) => openModal('view', user),
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 text-xs'
    },
    {
      label: 'Editar',
      icon: <Edit className="h-3 w-3" />,
      onClick: (user) => openModal('edit', user),
      variant: 'ghost',
      className: 'text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 text-xs'
    },
    {
      label: 'Permissões',
      icon: <Shield className="h-3 w-3" />,
      onClick: (user) => openModal('permissions', user),
      variant: 'ghost',
      className: 'text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 text-xs'
    }
  ]

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gerenciamento de Usuários</h1>
            <p className="text-slate-600 mt-1">Administre usuários, permissões e grupos do sistema</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status de Conexão */}
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Online</span>
            </div>
            
            {/* Estatísticas */}
            <span className="text-sm text-slate-500">
              Total: {totalItems} usuários
            </span>
            
            {/* Botão de Atualizar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshUsers}
              disabled={loading.users}
              className="p-2"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading.users ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Toggle de Filtros */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 ${hasActiveFilters() ? 'bg-blue-50 text-blue-600' : ''}`}
              title="Filtros"
            >
              <Filter className="h-4 w-4" />
              {hasActiveFilters() && (
                <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-1">
                  {Object.keys(filters).length}
                </span>
              )}
            </Button>
            
            {/* Botão Criar Usuário */}
            <Button
              onClick={() => openModal('create')}
              disabled={loading.users || !canCreateUsers()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Seção de Filtros */}
        {showFilters && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Buscar</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou email..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Função</label>
                <select
                  value={filters.roleId || ''}
                  onChange={(e) => updateFilter('roleId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Todas as funções</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={filters.enabled === undefined ? '' : filters.enabled ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFilter('enabled', value === '' ? undefined : value === 'true');
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Todos</option>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>
            
            {hasActiveFilters() && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tabela Principal */}
        <GenericCRUD<UsersResponseDto>
          title=""
          entityName="Usuário"
          entityNamePlural="Usuários"
          columns={columns}
          data={users}
          loading={loading.users}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          showSearch={false}
          showPagination={true}
          showActions={true}
          onPageChange={setCurrentPage}
          onDelete={handleDeleteUser}
          customActions={customActions}
          emptyMessage={hasActiveFilters() ? 
            "Nenhum usuário encontrado com os filtros aplicados" : 
            "Nenhum usuário cadastrado"
          }
        />

        {/* Modais */}
        <UserFormModal
          isOpen={modals.create}
          roles={roles}
          institutions={institutions}
          onClose={closeModals}
          onSuccess={handleModalSuccess}
        />

        <UserFormModal
          isOpen={modals.edit}
          user={selectedUser as any}
          roles={roles}
          institutions={institutions}
          onClose={closeModals}
          onSuccess={handleModalSuccess}
        />

        <UserViewModal
          isOpen={modals.view}
          user={selectedUser as any}
          roles={roles}
          institutions={institutions}
          onClose={closeModals}
          onEdit={(user) => {
            closeModals()
            setSelectedUser(user as unknown as UsersResponseDto)
            setModals(prev => ({ ...prev, edit: true }))
          }}
          onManagePermissions={(user) => {
            closeModals()
            setSelectedUser(user as unknown as UsersResponseDto)
            setModals(prev => ({ ...prev, permissions: true }))
          }}
        />

        <UserPermissionsModal
          isOpen={modals.permissions}
          user={selectedUser as any}
          onClose={closeModals}
          onSave={handleModalSuccess}
        />

        {/* Aviso de erro nos dados auxiliares */}
        {auxiliaryDataError && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
            <p className="text-sm">{auxiliaryDataError}</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
