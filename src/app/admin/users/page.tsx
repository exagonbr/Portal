'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ToastManager'
import { mockUsersService as usersService, mockInstitutionService as institutionService, mockRoleService as roleService } from '@/mocks/api';
import { UserResponseDto, UserFilterDto, RoleResponseDto, InstitutionResponseDto } from '@/types/api';
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import GenericCRUD, { CRUDColumn, CRUDAction } from '@/components/crud/GenericCRUD'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import UserFormModal from '@/components/admin/users/UserFormModal'
import UserPermissionsModal from '@/components/admin/users/UserPermissionsModal'
import UserViewModal from '@/components/admin/users/UserViewModal'
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
  
  const isMountedRef = useRef(true)
  
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([])
  const [loading, setLoading] = useState(true)
  const [auxiliaryDataLoaded, setAuxiliaryDataLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<UserFilterDto>({})
  const [auxiliaryDataError, setAuxiliaryDataError] = useState<string | null>(null)

  const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const loadAuxiliaryData = async () => {
    setAuxiliaryDataError(null);
    
    try {
      const [rolesResponse, institutionsResponse] = await Promise.all([
        roleService.getRoles({ page: 1, limit: 1000, sortBy: 'name', sortOrder: 'asc' }),
        institutionService.getInstitutions({ limit: 1000 })
      ]);

      setRoles(rolesResponse.items);
      setInstitutions(institutionsResponse.items);

    } catch (error) {
      console.error('❌ Erro ao carregar dados auxiliares:', error);
      setAuxiliaryDataError('Falha ao carregar dados auxiliares. Algumas opções podem estar indisponíveis.');
    } finally {
      setAuxiliaryDataLoaded(true);
    }
  }

  const loadUsers = useCallback(async (showLoadingIndicator = true) => {
    if (!isMountedRef.current) return;
    
    if (showLoadingIndicator) setLoading(true);

    try {
      const params: UserFilterDto = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'full_name',
        sortOrder: 'asc',
        ...filters,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await usersService.getUsers(params);

      if (!isMountedRef.current) return;
      
      setUsers(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);

    } catch (error: any) {
      showError('Erro ao carregar usuários');
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

  const canCreateUsers = () => {
    if (!user) return false
    const allowedRoles = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'admin']
    return allowedRoles.includes(user.role?.toUpperCase() || '')
  }

  const hasActiveFilters = () => {
    return Object.keys(filters).length > 0 &&
      Object.values(filters).some(value =>
        value !== undefined && value !== '' &&
        (typeof value !== 'object' || (value !== null && Object.keys(value).length > 0))
      );
  };

  const refreshUsers = () => {
    loadUsers(false)
  }

  const handleCreateUser = () => {
    if (!canCreateUsers()) {
      showError('Você não tem permissão para criar usuários.')
      return
    }
    setShowCreateModal(true)
  }

  const handleEditUser = (userToEdit: UserResponseDto) => {
    setSelectedUser(userToEdit)
    setShowEditModal(true)
  }

  const handleViewUser = (userToView: UserResponseDto) => {
    setSelectedUser(userToView)
    setShowViewModal(true)
  }

  const handleManagePermissions = (userForPermissions: UserResponseDto) => {
    setSelectedUser(userForPermissions)
    setShowPermissionsModal(true)
  }

  const handleDeleteUser = async (userToDelete: UserResponseDto) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userToDelete.full_name}"?`)) {
      return
    }

    try {
      await usersService.deleteUser(userToDelete.id.toString())
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

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined || value === null) {
      delete (newFilters as any)[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
    setCurrentPage(1);
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    showSuccess('Filtros limpos com sucesso')
  }

  useEffect(() => {
    loadAuxiliaryData();
  }, []);

  useEffect(() => {
    if (auxiliaryDataLoaded && isMountedRef.current) {
      loadUsers();
    }
  }, [loadUsers, auxiliaryDataLoaded]);

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

  const columns: CRUDColumn<UserResponseDto>[] = [
    {
      key: 'full_name',
      label: 'Usuário',
      sortable: true,
      width: '250px',
      render: (user) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user.full_name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-800 truncate">{user.full_name}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Mail className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role_id',
      label: 'Função',
      sortable: true,
      width: '120px',
      render: (user) => {
        const role = roles.find(r => r.id.toString() === user.role_id);
        const roleName = role?.name || 'Não definida'
        return (
          <Badge variant={getRoleBadgeVariant(roleName) as any} className="text-xs">
            {roleName}
          </Badge>
        )
      }
    },
    {
      key: 'institution_id',
      label: 'Instituição',
      width: '150px',
      render: (user) => {
        const institution = institutions.find(i => i.id.toString() === user.institution_id);
        const institutionName = institution?.name || 'Não vinculada'
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
      render: (user) => {
        const isActive = user.enabled
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
      key: 'date_created',
      label: 'Cadastro',
      sortable: true,
      width: '110px',
      render: (user) => {
        const dateString = user.date_created
        if (!dateString) return null;
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

  const customActions: CRUDAction<UserResponseDto>[] = [
    {
      label: 'Ver',
      icon: 'Eye',
      onClick: handleViewUser,
      variant: 'ghost' as any,
    },
    {
      label: 'Editar',
      icon: 'Edit',
      onClick: handleEditUser,
      variant: 'ghost' as any,
    },
    {
      label: 'Permissões',
      icon: 'Shield',
      onClick: handleManagePermissions,
      variant: 'ghost' as any,
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
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Online</span>
            </div>
            
            <span className="text-sm text-slate-500">
              Total: {totalItems} usuários
            </span>
            
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
                  value={filters.role_id || ''}
                  onChange={(e) => updateFilter('role_id', e.target.value)}
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
                  value={filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFilter('is_active', value === '' ? undefined : value === 'true');
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

        <GenericCRUD<UserResponseDto>
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

        <UserFormModal
          isOpen={showCreateModal}
          roles={roles}
          institutions={institutions}
          onClose={handleCloseModals}
          onSuccess={handleModalSuccess}
        />

        <UserFormModal
          isOpen={showEditModal}
          user={selectedUser}
          roles={roles}
          institutions={institutions}
          onClose={handleCloseModals}
          onSuccess={handleModalSuccess}
        />

        <UserViewModal
          isOpen={showViewModal}
          user={selectedUser}
          roles={roles}
          institutions={institutions}
          onClose={handleCloseModals}
          onEdit={(user) => {
            setShowViewModal(false)
            setSelectedUser(user)
            setShowEditModal(true)
          }}
          onManagePermissions={(user) => {
            setShowViewModal(false)
            setSelectedUser(user)
            setShowPermissionsModal(true)
          }}
        />

        <UserPermissionsModal
          isOpen={showPermissionsModal}
          user={selectedUser}
          onClose={handleCloseModals}
          onSave={handleModalSuccess}
        />
      </div>
    </AuthenticatedLayout>
  )
}
