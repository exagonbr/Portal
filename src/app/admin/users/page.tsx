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
import { UserResponseDto, UserFilterDto, RoleResponseDto, InstitutionResponseDto, UserDto } from '@/types/api'
import { formatDate } from '@/utils/date'
import UserModal from '@/components/modals/UserModal'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

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

export default function GlobalUsersPage() {
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
        roleService.getAll(),
        institutionService.getActiveInstitutions()
      ])
      setRoles(rolesResponse.data || [])
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
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await userService.deleteUser(id)
      showNotification('Usuário excluído com sucesso!', 'success')
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      showNotification(error.message || 'Erro ao excluir usuário', 'error')
    }
  }

  // Alternar status do usuário
  const handleToggleStatus = async (user: ExtendedUserResponseDto) => {
    try {
      const newStatus = !user.is_active
      await userService.updateUser(user.id, { is_active: newStatus })
      showNotification(`Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 'success')
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      showNotification(error.message || 'Erro ao alterar status do usuário', 'error')
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
      showNotification(error.message || 'Erro ao resetar senha', 'error')
    }
  }

  // Exportar usuários
  const handleExport = async () => {
    try {
      const result = await userService.exportUsers(filters, 'csv')
      showNotification('Exportação iniciada! Você receberá um email quando estiver pronta.', 'success')
    } catch (error: any) {
      console.error('Erro ao exportar:', error)
      showNotification(error.message || 'Erro ao exportar usuários', 'error')
    }
  }

  // Importar usuários
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await userService.importUsers(file)
      showNotification('Importação iniciada! Você receberá um email com o resultado.', 'success')
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao importar:', error)
      showNotification(error.message || 'Erro ao importar usuários', 'error')
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

  return (
    <DashboardPageLayout
      title="Gerenciar Usuários"
      subtitle="Gerencie todos os usuários do sistema"
      actions={headerActions}
    >
      {/* Notificação */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar por nome, email..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-l-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary-dark"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-primary-dark text-white px-4 py-2 rounded-r-lg hover:bg-primary-darker transition-colors"
          >
            Buscar
          </button>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          
          <label className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            Importar
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
          
          <button 
            onClick={handleCreateUser}
            className="flex items-center gap-1 px-3 py-2 bg-primary-dark text-white rounded-lg text-sm ml-2 hover:bg-primary-darker transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">Filtros Avançados</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Função
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filters.role || ''}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <option value="">Todas</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instituição
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filters.school_id || ''}
                onChange={(e) => setFilters({ ...filters, school_id: e.target.value })}
              >
                <option value="">Todas</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={(e) => setFilters({ ...filters, is_active: e.target.value === '' ? undefined : e.target.value === 'true' })}
              >
                <option value="">Todos</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ordenar por
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as any)
                  setSortOrder(order as any)
                }}
              >
                <option value="name-asc">Nome (A-Z)</option>
                <option value="name-desc">Nome (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
                <option value="created_at-desc">Mais recentes</option>
                <option value="created_at-asc">Mais antigos</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Tabela de usuários */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Função
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Instituição
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cadastrado em
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-dark"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Users className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-600 mb-1">Nenhum usuário encontrado</p>
                      <p className="text-sm text-slate-500">Tente ajustar os filtros ou criar um novo usuário.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={user.avatar} 
                              alt={user.name} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white font-medium">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.name}</div>
                          {user.username && (
                            <div className="text-xs text-slate-500">@{user.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <a href={`mailto:${user.email}`} className="hover:text-primary-dark">
                        {user.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role_name)}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role_name || 'Sem função'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.institution_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)} 
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleViewUser(user)} 
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(user.id)} 
                          className="text-orange-600 hover:text-orange-900 transition-colors p-1 rounded hover:bg-orange-50"
                          title="Resetar senha"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)} 
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  de <span className="font-medium">{totalItems}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium ${
                      currentPage === 1 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    &larr;
                  </button>
                  
                  {/* Páginas */}
                  {(() => {
                    const pages = []
                    const maxPagesToShow = 5
                    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
                    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
                    
                    if (endPage - startPage < maxPagesToShow - 1) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1)
                    }
                    
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                        >
                          1
                        </button>
                      )
                      if (startPage > 2) {
                        pages.push(
                          <span key="dots1" className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                            ...
                          </span>
                        )
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium ${
                            i === currentPage 
                              ? 'z-10 bg-primary-dark text-white border-primary-dark' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {i}
                        </button>
                      )
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="dots2" className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                            ...
                          </span>
                        )
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                        >
                          {totalPages}
                        </button>
                      )
                    }
                    
                    return pages
                  })()}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="sr-only">Próximo</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de CRUD */}
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

      {/* Modal de Detalhes */}
      {showDetailsModal && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </DashboardPageLayout>
  )
}
