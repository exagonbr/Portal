'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import GenericCRUD from '@/components/crud/GenericCRUD'
import Modal from '@/components/ui/Modal'
import CourseForm from '@/components/forms/CourseForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCRUD } from '@/hooks/useCRUD'
import { apiClient, BaseApiService } from '@/lib/api-client'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'
import { usePermissions } from '@/hooks/usePermissions'

interface Course {
  id: string
  name: string
  code: string
  description: string
  institution_id: string
  duration_hours: number
  level: 'basic' | 'intermediate' | 'advanced'
  category: string
  active: boolean
  created_at: string
  updated_at: string
}

const courseService = new BaseApiService<Course>('/courses')

export default function CoursesPage() {
  const { theme } = useTheme()
  const { isManagement } = usePermissions()
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
    service: courseService,
    entityName: 'Curso',
    autoFetch: true,
    paginated: true
  })

  const handleCreate = () => {
    setSelectedItem(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (course: Course) => {
    setSelectedItem(course)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleView = (course: Course) => {
    setSelectedItem(course)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleSubmit = async (data: Partial<Course>) => {
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

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      basic: { label: 'Básico', color: theme.colors.status.success },
      intermediate: { label: 'Intermediário', color: theme.colors.status.warning },
      advanced: { label: 'Avançado', color: theme.colors.status.error }
    }

    const config = levelConfig[level as keyof typeof levelConfig] || { 
      label: level, 
      color: theme.colors.text.secondary 
    }

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
      key: 'category',
      label: 'Categoria'
    },
    {
      key: 'level',
      label: 'Nível',
      render: (course: Course) => getLevelBadge(course.level)
    },
    {
      key: 'duration_hours',
      label: 'Duração',
      render: (course: Course) => `${course.duration_hours}h`
    },
    {
      key: 'active',
      label: 'Status',
      render: (course: Course) => (
        <span 
          className="flex items-center gap-2"
          style={{ color: course.active ? theme.colors.status.success : theme.colors.status.error }}
        >
          <span className="material-symbols-outlined text-sm">
            {course.active ? 'check_circle' : 'cancel'}
          </span>
          {course.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ]

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER, UserRole.ACADEMIC_COORDINATOR]}>
        <DashboardPageLayout
          title="Gerenciar Cursos"
          subtitle="Gerencie os cursos oferecidos pela instituição"
        >
          <GenericCRUD
            title=""
            entityName="Curso"
            entityNamePlural="Cursos"
            columns={columns}
            data={data}
            loading={loading}
            totalItems={pagination.total}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.pageSize}
            onPageChange={setPage}
            onSearch={search}
            onCreate={isManagement() ? handleCreate : undefined}
            onEdit={isManagement() ? handleEdit : undefined}
            onDelete={isManagement() ? (course) => remove(course.id) : undefined}
            onView={handleView}
          />

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={
              modalMode === 'create' 
                ? 'Novo Curso' 
                : modalMode === 'edit' 
                  ? 'Editar Curso' 
                  : 'Visualizar Curso'
            }
            size="xl"
          >
            <CourseForm
              course={selectedItem}
              mode={modalMode}
              onSubmit={handleSubmit}
              onCancel={() => setModalOpen(false)}
            />
          </Modal>
        </DashboardPageLayout>
    </ProtectedRoute>
  )
} 