'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import GenericCRUD from '@/components/crud/GenericCRUD'
import Modal from '@/components/ui/Modal'
import InstitutionForm from '@/components/forms/InstitutionForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCRUD } from '@/hooks/useCRUD'
import { BaseApiService } from '@/services/api'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'

interface Institution {
  id: string
  name: string
  code: string
  type: 'university' | 'school' | 'training_center'
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  active: boolean
  created_at: string
  updated_at: string
}

const institutionService = new BaseApiService<Institution>('/institutions')

export default function InstitutionsPage() {
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
    service: institutionService,
    entityName: 'Instituição',
    autoFetch: true,
    paginated: true
  })

  const handleCreate = () => {
    setSelectedItem(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (institution: Institution) => {
    setSelectedItem(institution)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleView = (institution: Institution) => {
    setSelectedItem(institution)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleSubmit = async (data: Partial<Institution>) => {
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

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      university: { label: 'Universidade', color: theme.colors.primary.DEFAULT },
      school: { label: 'Escola', color: theme.colors.secondary.DEFAULT },
      training_center: { label: 'Centro de Treinamento', color: theme.colors.accent.DEFAULT }
    }

    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, color: theme.colors.text.secondary }

    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: config.color + '20',
          color: config.color
        }}
      >
        {config.label}
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
      key: 'code',
      label: 'Código',
      sortable: true
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (institution: Institution) => getTypeBadge(institution.type)
    },
    {
      key: 'city',
      label: 'Cidade',
      render: (institution: Institution) => `${institution.city}, ${institution.state}`
    },
    {
      key: 'active',
      label: 'Status',
      render: (institution: Institution) => (
        <span 
          className="flex items-center gap-2"
          style={{ color: institution.active ? theme.colors.status.success : theme.colors.status.error }}
        >
          <span className="material-symbols-outlined text-sm">
            {institution.active ? 'check_circle' : 'cancel'}
          </span>
          {institution.active ? 'Ativa' : 'Inativa'}
        </span>
      )
    }
  ]

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <DashboardLayout>
        <DashboardPageLayout
          title="Gerenciar Instituições"
          subtitle="Gerencie as instituições de ensino cadastradas"
        >
          <GenericCRUD
            title=""
            entityName="Instituição"
            entityNamePlural="Instituições"
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
            onDelete={(institution) => remove(institution.id)}
            onView={handleView}
          />

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={
              modalMode === 'create' 
                ? 'Nova Instituição' 
                : modalMode === 'edit' 
                  ? 'Editar Instituição' 
                  : 'Visualizar Instituição'
            }
            size="lg"
          >
            <InstitutionForm
              institution={selectedItem}
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
