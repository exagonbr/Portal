'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Users, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Shield,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  UserCheck,
  UserX,
  Key
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { institutionService } from '@/services/institutionService'
import { UserResponseDto, UserFilterDto, RoleResponseDto, InstitutionResponseDto, UserWithRoleDto } from '@/types/api'
import { formatDate } from '@/utils/date'
import UserModal from '@/components/modals/UserModal'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastManager'
import GenericCRUD, { CRUDColumn } from '@/components/crud/GenericCRUD'
import { Badge } from '@/components/ui/Badge'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'

// Estendendo o tipo UserResponseDto para incluir campos adicionais
interface ExtendedUserResponseDto extends UserResponseDto {
  username?: string
  avatar?: string
  telefone?: string
  endereco?: string
  is_active: boolean
  created_at: string
  updated_at: string
  role_name?: string
  institution_name?: string
}

// Interface para o UserDto usado no modal
interface UserDto {
  id?: string
  name: string
  email: string
  username?: string
  role?: string
  role_id?: string
  avatar?: string
  isActive?: boolean
  institution_id?: string
  institution_name?: string
  createdAt?: string
  updatedAt?: string
}

// Componente de notificação
const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : AlertCircle

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center justify-between mb-4`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Componente de modal de detalhes do usuário
const UserDetailsModal = ({ user, onClose }: { user: ExtendedUserResponseDto | null; onClose: () => void }) => {
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img 
                  className="h-16 w-16 rounded-full object-cover border-2 border-white" 
                  src={user.avatar} 
                  alt={user.name} 
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-primary-light/80">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-light/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Informações Pessoais</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.telefone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{user.telefone}</span>
                  </div>
                )}
                {user.endereco && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="h-4 w-4" />
                    <span>{user.endereco}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Informações do Sistema</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="h-4 w-4" />
                  <span>Função: {user.role_name || 'Não definida'}</span>
                </div>
                {user.institution_name && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="h-4 w-4" />
                    <span>Instituição: {user.institution_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Cadastrado em: {formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.is_active ? (
                    <>
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Usuário Ativo</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Usuário Inativo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas do usuário */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-dark">0</div>
                <div className="text-sm text-slate-600">Cursos</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-dark">0</div>
                <div className="text-sm text-slate-600">Atividades</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-dark">0</div>
                <div className="text-sm text-slate-600">Certificados</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-dark">0h</div>
                <div className="text-sm text-slate-600">Tempo Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ManageUsers() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [users, setUsers] = useState<ExtendedUserResponseDto[]>([])
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ExtendedUserResponseDto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [filters, setFilters] = useState<UserFilterDto>({})
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const itemsPerPage = 10


  // Função para converter ExtendedUserResponseDto para UserDto
  const convertToUserDto = (user: ExtendedUserResponseDto): UserDto => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role_name,
      role_id: user.role_id,
      avatar: user.avatar,
      isActive: user.is_active,
      institution_id: user.institution_id,
      institution_name: user.institution_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  }

  // Função para mostrar notificações
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Carregar dados auxiliares (roles e instituições)
  const loadAuxiliaryData = async () => {
    try {
      const [rolesResponse, institutionsResponse] = await Promise.all([
        roleService.getActiveRoles(),
        institutionService.getActiveInstitutions()
      ])
      setRoles(rolesResponse || [])
      setInstitutions(institutionsResponse || [])
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error)
    }
  }

  // Carregar usuários
  const loadUsers = useCallback(async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true)
      
      const response = await userService.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
        ...filters
      })
      
      setUsers(response.items || [])
      setTotalPages(response.pagination?.totalPages || 1)
      setTotalItems(response.pagination?.total || 0)
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error)
      showNotification(error.message || 'Erro ao carregar usuários', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, searchTerm, filters, sortBy, sortOrder])

  useEffect(() => {
    loadAuxiliaryData()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Função de busca
  const handleSearch = () => {
    setCurrentPage(1)
    loadUsers()
  }

  // Função para atualizar lista
  const handleRefresh = () => {
    setRefreshing(true)
    loadUsers(false)
  }

  // Criar novo usuário
  const handleCreateUser = () => {
    setSelectedUser(null)
    setShowModal(true)
  }

  // Editar usuário
  const handleEditUser = (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  // Visualizar detalhes do usuário
  const handleViewUser = (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  // Excluir usuário
  const handleDeleteUser = async (user: ExtendedUserResponseDto) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await userService.deleteUser(user.id)
      showSuccess('Usuário excluído com sucesso!')
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      showError(error.message || 'Erro ao excluir usuário')
    }
  }

  // Alternar status do usuário
  const handleToggleStatus = async (user: ExtendedUserResponseDto) => {
    try {
      const newStatus = !user.is_active
      await userService.updateUser(user.id, { is_active: newStatus })
      showSuccess(`Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!`)
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      showError(error.message || 'Erro ao alterar status do usuário')
    }
  }

  // Resetar senha do usuário
  const handleResetPassword = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja resetar a senha deste usuário?')) {
      return
    }

    try {
      // Implementar lógica de reset de senha quando disponível na API
      showNotification('Funcionalidade de reset de senha será implementada em breve', 'info')
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error)
      showError(error.message || 'Erro ao resetar senha')
    }
  }

  // Exportar usuários
  const handleExport = async () => {
    try {
      const result = await userService.exportUsers(filters, 'csv')
      showSuccess('Exportação iniciada! Você receberá um email quando estiver pronta.')
    } catch (error: any) {
      console.error('Erro ao exportar:', error)
      showError(error.message || 'Erro ao exportar usuários')
    }
  }

  // Importar usuários
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await userService.importUsers(file)
      showSuccess('Importação iniciada! Você receberá um email com o resultado.')
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao importar:', error)
      showError(error.message || 'Erro ao importar usuários')
    }
  }

  // Aplicar filtros
  const handleApplyFilters = () => {
    setCurrentPage(1)
    setShowFilters(false)
    loadUsers()
  }

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    setSortBy('name')
    setSortOrder('asc')
    setShowFilters(false)
    loadUsers()
  }

  // Função para obter cor do role
  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'bg-red-100 text-red-800'
      case 'teacher':
      case 'professor':
        return 'bg-blue-100 text-blue-800'
      case 'student':
      case 'aluno':
      case 'estudante':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">
        Total: {totalItems} usuários
      </span>
      <button
        onClick={handleRefresh}
        className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 ${refreshing ? 'animate-spin' : ''}`}
        title="Atualizar lista"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'danger'
      case 'teacher': return 'warning'
      case 'student': return 'info'
      case 'coordinator': return 'success'
      default: return 'secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'teacher': return 'Professor'
      case 'student': return 'Aluno'
      case 'coordinator': return 'Coordenador'
      default: return role
    }
  }

  const columns: CRUDColumn<ExtendedUserResponseDto>[] = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'role',
      label: 'Função',
      render: (user) => {
        const roleName = user?.role_name || ''
        return (
          <Badge variant={getRoleBadgeVariant(roleName)}>
            {getRoleLabel(roleName) || 'Sem função'}
          </Badge>
        )
      }
    },
    {
      key: 'institution_name',
      label: 'Instituição',
      sortable: true,
      render: (user) => user?.institution_name || 'Não definida'
    },
    {
      key: 'active',
      label: 'Status',
      render: (user) => (
        <Badge variant={user?.is_active ? "success" : "danger"}>
          {user?.is_active ? "Ativo" : "Inativo"}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Cadastrado em',
      render: (user) => user?.created_at ? formatDate(user.created_at) : 'Nunca'
    }
  ]

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        
        <GenericCRUD
          title="Gerenciamento de Usuários"
          entityName="Usuário"
          entityNamePlural="Usuários"
          columns={columns}
          data={users}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onSearch={handleSearch}
          onCreate={handleCreateUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onView={handleViewUser}
          searchPlaceholder="Buscar usuários..."
          createPermission="users.create"
          editPermission="users.edit"
          deletePermission="users.delete"
          viewPermission="users.view"
        />

        {showModal && (
          <UserModal
            show={showModal}
            user={selectedUser ? convertToUserDto(selectedUser) : null}
            onClose={() => {
              setShowModal(false)
              setSelectedUser(null)
            }}
            onSave={() => {
              setShowModal(false)
              setSelectedUser(null)
              loadUsers()
            }}
          />
        )}

        {showDetailsModal && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedUser(null)
            }}
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}
