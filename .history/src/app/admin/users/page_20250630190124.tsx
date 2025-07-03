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
  Key,
  Mail,
  Building2,
  Calendar,
  Users,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Activity
} from 'lucide-react'

// Função debounce
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
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
  const [loading, setLoading] = useState(true)
  const [auxiliaryDataLoaded, setAuxiliaryDataLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<UsersFilterDto>({})
  const [auxiliaryDataError, setAuxiliaryDataError] = useState<string | null>(null)

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UsersResponseDto | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Carregar dados auxiliares (roles e instituições)
  const loadAuxiliaryData = async () => {
    setAuxiliaryDataError(null);
    
    try {
      console.log('🔄 Carregando dados auxiliares (roles e instituições)...');
      
      // Carregar roles e instituições separadamente para melhor tratamento de erro
      try {
        const rolesFromApi = await roleService.getActiveRoles();
        console.log('✅ Roles carregadas da API:', rolesFromApi.map(r => ({ id: r.id, name: r.name })));
        setRoles(rolesFromApi);
      } catch (error) {
        console.error('❌ Erro ao carregar roles:', error);
        setAuxiliaryDataError('Falha ao carregar funções. Algumas opções podem estar indisponíveis.');
        setRoles([]);
      }

      try {
        const institutionsFromApi = await institutionService.getActiveInstitutions();
        console.log('✅ Instituições carregadas da API:', institutionsFromApi.map(i => ({ id: i.id, name: i.name })));
        setInstitutions(institutionsFromApi);
      } catch (error) {
        console.error('❌ Erro ao carregar instituições:', error);
        setAuxiliaryDataError(prev =>
          prev ? `${prev} Falha ao carregar instituições.` : 'Falha ao carregar instituições. Algumas opções podem estar indisponíveis.'
        );
        setInstitutions([]);
      }

      console.log('📊 Dados auxiliares carregados');

    } catch (error) {
      console.error('❌ Erro ao carregar dados auxiliares:', error);
      setAuxiliaryDataError('Falha ao carregar dados auxiliares. Algumas opções podem estar indisponíveis.');
    } finally {
      setAuxiliaryDataLoaded(true);
      console.log('🏁 Carregamento de dados auxiliares finalizado');
    }
  }

  // Carregar usuários
  const loadUsers = useCallback(async (showLoadingIndicator = true) => {
    if (!isMountedRef.current) return;
    
    if (showLoadingIndicator) setLoading(true);

    try {
      const params: UsersFilterDto = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'name',
        sortOrder: 'asc',
        ...filters,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      console.log('🔍 Iniciando busca de usuários com parâmetros:', params);

      const response = await usersService.getUsers(params);

      console.log('📥 Resposta recebida do usersService:', {
        items: response.items?.length || 0,
        pagination: response.pagination,
        primeiroUsuario: response.items?.[0]?.fullName || 'Nenhum',
        ultimoUsuario: response.items?.[response.items?.length - 1]?.fullName || 'Nenhum'
      });

      // Verificar se o componente ainda está montado antes de atualizar o estado
      if (!isMountedRef.current) return;
      
      setUsers(response.items || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);

      // Log de sucesso
      if (response.items && response.items.length > 0) {
        console.log(`✅ ${response.items.length} usuários carregados com sucesso (página ${response.pagination?.page} de ${response.pagination?.totalPages})`);
      } else {
        console.warn('⚠️ Nenhum usuário encontrado com os filtros aplicados');
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error);
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao carregar usuários';
      if (error.message) {
        if (error.message.includes('Network')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique se o backend está rodando.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Erro de autenticação. Faça login novamente.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Contate o suporte.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showError(errorMessage);
      
      // Em caso de erro, limpa a lista para evitar exibir dados incorretos
      if (isMountedRef.current) {
        setUsers([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, searchTerm, filters, itemsPerPage, showError]);

  // Check if user has permission to create users
  const canCreateUsers = () => {
    if (!user) return false
    const allowedRoles = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'SCHOOL_MANAGER', 'admin']
    return allowedRoles.includes(user.role?.toUpperCase() || '')
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = () => {
    return Object.keys(filters).length > 0 &&
      Object.values(filters).some(value =>
        value !== undefined && value !== '' &&
        (typeof value !== 'object' || Object.keys(value).length > 0)
      );
  };

  // Função para atualizar lista
  const refreshUsers = () => {
    loadUsers(false)
  }

  // Handlers
  const handleCreateUser = () => {
    if (!canCreateUsers()) {
      showError('Você não tem permissão para criar usuários.')
      return
    }
    setShowCreateModal(true)
  }

  const handleEditUser = (userToEdit: UsersResponseDto) => {
    setSelectedUser(userToEdit)
    setShowEditModal(true)
  }

  const handleViewUser = (userToView: UsersResponseDto) => {
    setSelectedUser(userToView)
    setShowViewModal(true)
  }

  const handleManagePermissions = (userForPermissions: UsersResponseDto) => {
    setSelectedUser(userForPermissions)
    setShowPermissionsModal(true)
  }

  const handleDeleteUser = async (userToDelete: UsersResponseDto) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userToDelete.fullName}"?`)) {
      return
    }

    try {
      await usersService.deleteUser(userToDelete.id)
      showSuccess('Usuário excluído com sucesso!')
      loadUsers()
    } catch (error: any) {
      showError(error.message || 'Erro ao excluir usuário')
    }
  }

  const handleCloseModals = () => {
    setSelectedUser(null)
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowViewModal(false)
    setShowPermissionsModal(false)
  }

  const handleModalSuccess = () => {
    handleCloseModals()
    refreshUsers()
  }

  // Filter functions
  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined || value === null) {
      delete (newFilters as any)[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  }

  // Limpar filtros
  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    showSuccess('Filtros limpos com sucesso')
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadAuxiliaryData();
  }, []);

  useEffect(() => {
    if (auxiliaryDataLoaded && isMountedRef.current) {
      console.log('🔄 Dados auxiliares carregados, iniciando carregamento de usuários...');
      loadUsers();
    }
  }, [loadUsers, auxiliaryDataLoaded]);

  // Recarregar dados quando filtros, página ou ordenação mudarem (com debounce)
  useEffect(() => {
    if (!auxiliaryDataLoaded || !isMountedRef.current) {
      console.log('⏳ Aguardando dados auxiliares para aplicar filtros...');
      return;
    }

    console.log('🔄 Filtros/paginação alterados, recarregando usuários...', {
      currentPage,
      hasFilters: hasActiveFilters(),
      filters: Object.keys(filters),
      searchTerm: searchTerm || 'nenhum'
    });

    // Debounce para evitar chamadas excessivas
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, filters, searchTerm, auxiliaryDataLoaded]);

  // Role badge variant
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

  // Table columns
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

  // Custom actions for the table
  const customActions: CRUDAction<UsersResponseDto>[] = [
    {
      label: 'Ver',
      icon: <Eye className="h-3 w-3" />,
      onClick: handleViewUser,
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 text-xs'
    },
    {
      label: 'Editar',
      icon: <Edit className="h-3 w-3" />,
      onClick: handleEditUser,
      variant: 'ghost',
      className: 'text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 text-xs'
    },
    {
      label: 'Permissões',
      icon: <Shield className="h-3 w-3" />,
      onClick: handleManagePermissions,
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
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Online</span>
            </div>
            
            {/* Stats */}
            <span className="text-sm text-slate-500">
              Total: {totalItems} usuários
            </span>
            
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshUsers}
              disabled={loading}
              className="p-2"
              title="Atualizar lista"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* Filter Toggle */}
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
            
            {/* Create User Button */}
            <Button
              onClick={handleCreateUser}
              disabled={loading || !canCreateUsers()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Filters Section - Simplified */}
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

        {/* Main Table */}
        <GenericCRUD<UsersResponseDto>
          title=""
          entityName="Usuário"
          entityNamePlural="Usuários"
          columns={columns}
          data={users}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
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

        {/* Modals */}
        <UserFormModal
          isOpen={showCreateModal}
          roles={roles}
          institutions={institutions}
          onClose={handleCloseModals}
          onSuccess={handleModalSuccess}
        />

        <UserFormModal
          isOpen={showEditModal}
          user={selectedUser as any}
          roles={roles}
          institutions={institutions}
          onClose={handleCloseModals}
          onSuccess={handleModalSuccess}
        />

        <UserViewModal
          isOpen={showViewModal}
          user={selectedUser as any}
          roles={roles}
          institutions={institutions}
          onClose={handleCloseModals}
          onEdit={(user) => {
            setShowViewModal(false)
            setSelectedUser(user as unknown as UsersResponseDto)
            setShowEditModal(true)
          }}
          onManagePermissions={(user) => {
            setShowViewModal(false)
            setSelectedUser(user as unknown as UsersResponseDto)
            setShowPermissionsModal(true)
          }}
        />

        <UserPermissionsModal
          isOpen={showPermissionsModal}
          user={selectedUser as any}
          onClose={handleCloseModals}
          onSave={handleModalSuccess}
        />
      </div>
    </AuthenticatedLayout>
  )
}
