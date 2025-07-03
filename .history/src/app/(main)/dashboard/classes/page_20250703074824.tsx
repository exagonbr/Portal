'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import GenericCRUD from '@/components/crud/GenericCRUD'
import Modal from '@/components/ui/Modal'
import ClassForm from '@/components/forms/ClassForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCRUD } from '@/hooks/useCRUD'
import { apiClient } from '@/lib/api-client'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'
import { usePermissions } from '@/hooks/usePermissions'
import { Button, ButtonGroup } from '@/components/ui/Button';

interface Class {
  id: string
  name: string
  code: string
  course_id: string
  course_name?: string
  teacher_id: string
  teacher_name?: string
  start_date: string
  end_date: string
  schedule: string
  max_students: number
  enrolled_students?: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}


export default function ClassesPage() {
  const { theme } = useTheme()
  const { isManagement, isTeacher } = usePermissions()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [studentsModalOpen, setStudentsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  
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
    service: apiClient,
    endpoint: '/classes',
    entityName: 'Turma',
    autoFetch: true,
    paginated: true
  })

  const handleCreate = () => {
    setSelectedItem(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (classItem: Class) => {
    setSelectedItem(classItem)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleView = (classItem: Class) => {
    setSelectedItem(classItem)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleViewStudents = (classItem: Class) => {
    setSelectedClass(classItem)
    setStudentsModalOpen(true)
  }

  const handleSubmit = async (data: Partial<Class>) => {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planned: { label: 'Planejada', color: theme.colors.status.info },
      in_progress: { label: 'Em Andamento', color: theme.colors.status.success },
      completed: { label: 'Concluída', color: theme.colors.text.secondary },
      cancelled: { label: 'Cancelada', color: theme.colors.status.error }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
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
      key: 'course_name',
      label: 'Curso'
    },
    {
      key: 'teacher_name',
      label: 'Professor'
    },
    {
      key: 'schedule',
      label: 'Horário'
    },
    {
      key: 'students',
      label: 'Alunos',
      render: (classItem: Class) => (
        <span>
          {classItem.enrolled_students || 0}/{classItem.max_students}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (classItem: Class) => getStatusBadge(classItem.status)
    }
  ]

  const customActions = [
    {
      label: 'Ver Alunos',
      icon: 'group',
      onClick: handleViewStudents,
      variant: 'secondary' as const
    }
  ]

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER, UserRole.COORDINATOR, UserRole.TEACHER]}>
        <DashboardPageLayout
          title="Gerenciar Turmas"
          subtitle="Gerencie as turmas e seus alunos"
        >
          <GenericCRUD
            title=""
            entityName="Turma"
            entityNamePlural="Turmas"
            columns={columns}
            data={data}
            loading={loading}
            totalItems={pagination.total}
            currentPage={pagination.currentPage}
            itemsPerPage={pagination.pageSize}
            onPageChange={setPage}
            onSearch={search}
            onCreate={isManagement() ? handleCreate : undefined}
            onEdit={isManagement() || isTeacher() ? handleEdit : undefined}
            onDelete={isManagement() ? (classItem) => remove(classItem.id) : undefined}
            onView={handleView}
            customActions={customActions}
          />

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={
              modalMode === 'create' 
                ? 'Nova Turma' 
                : modalMode === 'edit' 
                  ? 'Editar Turma' 
                  : 'Visualizar Turma'
            }
            size="xl"
          >
            <ClassForm
              classItem={selectedItem}
              mode={modalMode}
              onSubmit={handleSubmit}
              onCancel={() => setModalOpen(false)}
            />
          </Modal>

          <Modal
            isOpen={studentsModalOpen}
            onClose={() => setStudentsModalOpen(false)}
            title={`Alunos da Turma: ${selectedClass?.name}`}
            size="xl"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p style={{ color: theme.colors.text.secondary }}>
                  {selectedClass?.enrolled_students || 0} de {selectedClass?.max_students} alunos matriculados
                </p>
                {isManagement() && (
                  <Button
                    variant="default"
                    size="sm"
                  >
                    Adicionar Aluno
                  </Button>
                )}
              </div>
              
              {/* Lista de alunos seria carregada aqui */}
              <div className="text-center py-8" style={{ color: theme.colors.text.secondary }}>
                <span className="material-symbols-outlined text-4xl opacity-50">group</span>
                <p className="mt-2">Lista de alunos será exibida aqui</p>
              </div>
            </div>
          </Modal>
        </DashboardPageLayout>
    </ProtectedRoute>
  )
} 