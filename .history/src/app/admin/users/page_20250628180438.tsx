'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ToastManager'
import { useUsers } from '@/hooks/useUsers'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import GenericCRUD, { CRUDColumn, CRUDAction } from '@/components/crud/GenericCRUD'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import UserFormModal from '@/components/admin/users/UserFormModal'
import UserPermissionsModal from '@/components/admin/users/UserPermissionsModal'
import UserViewModal from '@/components/admin/users/UserViewModal'
import UserFilters from '@/components/admin/users/UserFilters'
import { UserResponseDto } from '@/types/api'
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

// Enhanced user interface with role and institution names
interface ExtendedUserResponseDto extends UserResponseDto {
  role_name?: string
  institution_name?: string
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  
  // Use the custom hook for user management
  const {
    users,
    roles,
    institutions,
    loading,
    auxiliaryDataLoaded,
    currentPage,
    totalItems,
    itemsPerPage,
    searchTerm,
    filters,
    auxiliaryDataError,
    hasActiveFilters,
    setCurrentPage,
    setItemsPerPage,
    setSearchTerm,
    setFilters,
    clearFilters,
    refreshUsers,
    deleteUser
  } = useUsers({ initialPageSize: 10 })

  // Modal states
  const [selectedUser, setSelectedUser] = useState<ExtendedUserResponseDto | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Check if user has permission to create users
  const canCreateUsers = () => {
    if (!user) return false
    const allowedRoles = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'admin']
    return allowedRoles.includes(user.role?.toUpperCase() || '')
  }

  // Handlers
  const handleCreateUser = () => {
    if (!canCreateUsers()) {
      showError('Você não tem permissão para criar usuários.')
      return
    }
    setShowCreateModal(true)
  }

  const handleEditUser = (userToEdit: ExtendedUserResponseDto) => {
    setSelectedUser(userToEdit)
    setShowEditModal(true)
  }

  const handleViewUser = (userToView: ExtendedUserResponseDto) => {
    setSelectedUser(userToView)
    setShowViewModal(true)
  }

  const handleManagePermissions = (userForPermissions: ExtendedUserResponseDto) => {
    setSelectedUser(userForPermissions)
    setShowPermissionsModal(true)
  }

  const handleDeleteUser = async (userToDelete: ExtendedUserResponseDto) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userToDelete.name}"?`)) {
      return
    }

    try {
      await deleteUser(userToDelete.id)
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
    setFilters((prev: any) => {
      if (value === '' || value === undefined || value === null) {
        const newFilters = { ...prev }
        delete newFilters[key as keyof typeof prev]
        return newFilters
      }
      return { ...prev, [key]: value }
    })
  }

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
  const columns: CRUDColumn<ExtendedUserResponseDto>[] = [
    {
      key: 'name',
      label: 'Usuário',
      sortable: true,
      width: '250px',
      render: (_, user) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-slate-800 truncate">{user.name}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Mail className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role_name',
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
      key: 'is_active',
      label: 'Status',
      width: '90px',
      render: (_, user) => (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {user.is_active ? "Ativo" : "Inativo"}
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Cadastro',
      sortable: true,
      width: '110px',
      render: (_, user) => {
        const date = new Date(user.created_at)
        const formattedDate = date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        })
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-orange-500 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-700" title={formatDate(user.created_at)}>
              {formattedDate}
            </span>
          </div>
        )
      }
    }
  ]

  // Custom actions for the table
  const customActions: CRUDAction<ExtendedUserResponseDto>[] = [
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

        {/* Filters Component */}
        <UserFilters
          showFilters={showFilters}
          searchTerm={searchTerm}
          filters={filters}
          roles={roles}
          institutions={institutions}
          auxiliaryDataLoaded={auxiliaryDataLoaded}
          auxiliaryDataError={auxiliaryDataError}
          hasActiveFilters={hasActiveFilters}
          onSearchTermChange={setSearchTerm}
          onFilterChange={(key, value) => updateFilter(key, value)}
          onClearFilters={clearFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        {/* Main Table */}
        <GenericCRUD<ExtendedUserResponseDto>
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
