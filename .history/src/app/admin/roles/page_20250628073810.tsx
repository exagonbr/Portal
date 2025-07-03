'use client'

import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

// Componentes
import { RolesList } from './components/RolesList'
import { RoleDetails } from './components/RoleDetails'
import { RoleFilters } from './components/RoleFilters'
import { NotificationMessages } from './components/NotificationMessages'
import { CreateRoleModal } from './components/modals/CreateRoleModal'
import { EditRoleModal } from './components/modals/EditRoleModal'
import { UserAssignmentModal } from './components/modals/UserAssignmentModal'

// Hooks
import { useRoles } from './hooks/useRoles'
import { useRolePermissions } from './hooks/useRolePermissions'
import { useRoleFilters } from './hooks/useRoleFilters'

// Types
import { RoleResponseDto } from '@/types/api'

export default function RolesPermissionsPage() {
  // Estado principal
  const {
    roles,
    allUsers,
    loading,
    error,
    success,
    rateLimitWarning,
    loadRoles,
    loadUsers,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
    duplicateRole,
    assignUsers,
    clearMessages,
    setError
  } = useRoles()

  // Permissões
  const {
    permissions,
    loadingPermissions,
    loadPermissionsForRole,
    clearPermissionsCache
  } = useRolePermissions()

  // Filtros
  const {
    filters,
    filteredRoles,
    showFilters,
    setFilters,
    setShowFilters,
    clearFilters,
    hasActiveFilters
  } = useRoleFilters(roles)

  // Estado local
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [userAssignmentModalOpen, setUserAssignmentModalOpen] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<RoleResponseDto | null>(null)
  const [roleForUserAssignment, setRoleForUserAssignment] = useState<RoleResponseDto | null>(null)

  // Carregar dados iniciais
  useEffect(() => {
    loadRoles()
    loadUsers()
  }, [loadRoles, loadUsers])

  // Carregar permissões quando uma role é selecionada
  useEffect(() => {
    if (selectedRoleId && !permissions[selectedRoleId] && !loadingPermissions[selectedRoleId]) {
      loadPermissionsForRole(selectedRoleId)
    }
  }, [selectedRoleId, permissions, loadingPermissions, loadPermissionsForRole])

  // Handlers
  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId)
  }

  const handleCreateRole = async (roleData: any) => {
    try {
      await createRole(roleData)
      setCreateModalOpen(false)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleEditRole = (role: RoleResponseDto) => {
    setRoleToEdit(role)
    setEditModalOpen(true)
  }

  const handleUpdateRole = async (id: string, roleData: any) => {
    try {
      await updateRole(id, roleData)
      clearPermissionsCache(id) // Limpar cache de permissões
      setEditModalOpen(false)
      setRoleToEdit(null)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita.'
    )
    
    if (!confirmed) return

    try {
      await deleteRole(roleId)
      clearPermissionsCache(roleId) // Limpar cache de permissões
      if (selectedRoleId === roleId) {
        setSelectedRoleId(null)
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleToggleRoleStatus = async (roleId: string, active: boolean) => {
    try {
      await toggleRoleStatus(roleId, active)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleDuplicateRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return

    const newName = window.prompt('Nome para a nova função:', `${role.name} (Cópia)`)
    if (!newName) return

    try {
      await duplicateRole(roleId, newName)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  const handleAssignUsers = (role: RoleResponseDto) => {
    setRoleForUserAssignment(role)
    setUserAssignmentModalOpen(true)
  }

  const handleAssignUsersSubmit = async (roleId: string, userIds: string[]) => {
    try {
      await assignUsers(roleId, userIds)
      setUserAssignmentModalOpen(false)
      setRoleForUserAssignment(null)
    } catch (error) {
      // Erro já tratado no hook
    }
  }

  // Dados da role selecionada
  const selectedRole = selectedRoleId ? roles.find(r => r.id === selectedRoleId) || null : null
  const selectedRolePermissions = selectedRoleId ? permissions[selectedRoleId] : null
  const selectedRoleLoadingPermissions = selectedRoleId ? loadingPermissions[selectedRoleId] : false

  // Ações do header
  const headerActions = (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
          showFilters || hasActiveFilters
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        <span>Filtros</span>
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {Object.values(filters).filter(v => v !== '').length}
          </span>
        )}
      </button>
      
      <button
        onClick={() => setCreateModalOpen(true)}
        className="px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        <Plus className="h-4 w-4" />
        Nova Função
      </button>
    </div>
  )

  return (
    <DashboardPageLayout
      title="Gerenciar Funções e Permissões"
      subtitle="Configure papéis, permissões e atribuições de usuários no sistema"
      actions={headerActions}
    >
      {/* Filtros */}
      <RoleFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        isVisible={showFilters}
        onToggleVisibility={() => setShowFilters(!showFilters)}
      />

      {/* Mensagens de notificação */}
      <NotificationMessages
        error={error}
        success={success}
        rateLimitWarning={rateLimitWarning}
        onClearError={() => setError(null)}
      />

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de funções */}
        <div className="lg:col-span-1">
          <RolesList
            roles={filteredRoles}
            selectedRoleId={selectedRoleId}
            loading={loading}
            onSelectRole={handleSelectRole}
            onEditRole={handleEditRole}
            onAssignUsers={handleAssignUsers}
            onDuplicateRole={handleDuplicateRole}
            onToggleRoleStatus={handleToggleRoleStatus}
            onDeleteRole={handleDeleteRole}
            onRefresh={loadRoles}
          />
        </div>

        {/* Detalhes da função */}
        <div className="lg:col-span-2">
          <RoleDetails
            role={selectedRole}
            permissions={selectedRolePermissions}
            loadingPermissions={selectedRoleLoadingPermissions}
          />
        </div>
      </div>

      {/* Modais */}
      <CreateRoleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateRole}
        loading={loading}
      />

      <EditRoleModal
        isOpen={editModalOpen}
        role={roleToEdit}
        onClose={() => {
          setEditModalOpen(false)
          setRoleToEdit(null)
        }}
        onSave={handleUpdateRole}
        loading={loading}
      />

      <UserAssignmentModal
        isOpen={userAssignmentModalOpen}
        role={roleForUserAssignment}
        users={allUsers}
        onClose={() => {
          setUserAssignmentModalOpen(false)
          setRoleForUserAssignment(null)
        }}
        onAssignUsers={handleAssignUsersSubmit}
        loading={loading}
      />
    </DashboardPageLayout>
  )
}
