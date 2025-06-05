'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import GenericCRUD from '@/components/crud/GenericCRUD'
import Modal from '@/components/ui/Modal'
import UserForm from '@/components/forms/UserForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCRUD } from '@/hooks/useCRUD'
import { BaseApiService } from '@/services/api'
import { UserRole } from '@/types/roles'
import { useTheme } from '@/contexts/ThemeContext'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  institution_id?: string
  school_id?: string
  active: boolean
  created_at: string
  updated_at: string
}

// Serviço de API para usuários
const userService = new BaseApiService<User>('/users')

export default function UsersPage() {
  const { theme } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  
  const {
    data,
    loading,
    selectedItem,
    pagination,
    create,
    update,
    remove,
    search,
    setSelectedItem,
    setPage
  } = useCRUD({
    service: userService,
    entityName: 'Usuário',
    autoFetch: true,
    paginated: true
  })

  const handleCreate = () => {
    setSelectedItem(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedItem(user)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleView = (user: User) => {
    setSelectedItem(user)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleSubmit = async (data: Partial<User>) => {
    if (modalMode === 'create') {
      const result = await create(data)
      if (result) {
        setModalOpen(false)
      }
    } else if (modalMode === 'edit' && selectedItem) {
      const result = await update(selectedItem.id, data)
      if (result) {
        setModalOpen(false)
      }
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      [UserRole.SYSTEM_ADMIN]: { bg: theme.colors.status.error, text: '#fff' },
      [UserRole.INSTITUTION_MANAGER]: { bg: theme.colors.status.warning, text: '#000' },
      [UserRole.ACADEMIC_COORDINATOR]: { bg: theme.colors.status.info, text: '#fff' },
      [UserRole.TEACHER]: { bg: theme.colors.primary.DEFAULT, text: theme.colors.primary.contrast },
      [UserRole.STUDENT]: { bg: theme.colors.secondary.DEFAULT, text: theme.colors.secondary.contrast },
      [UserRole.GUARDIAN]: { bg: theme.colors.accent.DEFAULT, text: theme.colors.accent.contrast }
    }

    const roleLabels = {
      [UserRole.SYSTEM_ADMIN]: 'Admin Sistema',
      [UserRole.INSTITUTION_MANAGER]: 'Gestor Instituição',
      [UserRole.ACADEMIC_COORDINATOR]: 'Coordenador',
      [UserRole.TEACHER]: 'Professor',
      [UserRole.STUDENT]: 'Aluno',
      [UserRole.GUARDIAN]: 'Responsável'
    }

    const colors = roleColors[role] || { bg: theme.colors.background.tertiary, text: theme.colors.text.primary }

    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: colors.bg,
          color: colors.text
        }}
      >
        {roleLabels[role] || role}
      </span>
    )
  }

  const columns = [
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
      label: 'Perfil',
      render: (user: User) => getRoleBadge(user.role)
    },
    {
      key: 'active',
      label: 'Status',
      render: (user: User) => (
        <span 
          className="flex items-center gap-2"
          style={{ color: user.active ? theme.colors.status.success : theme.colors.status.error }}
        >
          <span className="material-symbols-outlined text-sm">
            {user.active ? 'check_circle' : 'cancel'}
          </span>
          {user.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (user: User) => new Date(user.created_at).toLocaleDateString('pt-BR')
    }
  ]

  return (
    <ProtectedRoute requiredPermission="users.view">
      <DashboardLayout>
        <DashboardPageLayout
          title="Gerenciar Usuários"
          subtitle="Gerencie os usuários do sistema"
        >
          <GenericCRUD
            title=""
            entityName="Usuário"
            entityNamePlural="Usuários"
            columns={columns}
            data={data}
            loading={loading}
            totalItems={pagination.total}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.pageSize}
            onPageChange={setPage}
            onSearch={search}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={(user) => remove(user.id)}
            onView={handleView}
            createPermission="users.create"
            editPermission="users.update"
            deletePermission="users.delete"
            viewPermission="users.view"
          />

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={
              modalMode === 'create' 
                ? 'Novo Usuário' 
                : modalMode === 'edit' 
                  ? 'Editar Usuário' 
                  : 'Visualizar Usuário'
            }
            size="lg"
          >
            <UserForm
              user={selectedItem}
              mode={modalMode}
              onSubmit={handleSubmit}
              onCancel={() => setModalOpen(false)}
            />
          </Modal>
        </DashboardPageLayout>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
