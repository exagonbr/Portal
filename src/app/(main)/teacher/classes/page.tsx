'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Users, BookOpen, Calendar, TrendingUp, AlertCircle, Plus, Eye, Edit, MoreVertical } from 'lucide-react'
import { StatCard, ContentCard } from '@/components/ui/StandardCard'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import GenericCRUD from '@/components/crud/GenericCRUD'
import Modal from '@/components/ui/Modal'
import ClassForm from '@/components/forms/ClassForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCRUD } from '@/hooks/useCRUD'
import { apiClient, BaseApiService } from '@/lib/api-client'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'
import { useRouter } from 'next/navigation'
import Card, { CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button, ButtonGroup } from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

const classService = new BaseApiService<Class>('/classes')

export default function TeacherClassesPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
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
    service: classService,
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

  const handleManageStudents = (classItem: Class) => {
    router.push(`/teacher/classes/${classItem.id}/students`)
  }

  const handleViewAttendance = (classItem: Class) => {
    router.push(`/teacher/classes/${classItem.id}/attendance`)
  }

  const handleViewGrades = (classItem: Class) => {
    router.push(`/teacher/classes/${classItem.id}/grades`)
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
      completed: { label: 'Concluída', color: theme.colors.status.warning },
      cancelled: { label: 'Cancelada', color: theme.colors.status.error }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: theme.colors.text.secondary }

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
      label: 'Curso',
      sortable: true
    },
    {
      key: 'schedule',
      label: 'Horário'
    },
    {
      key: 'students',
      label: 'Alunos',
      render: (classItem: Class) => (
        <span>{classItem.enrolled_students || 0}/{classItem.max_students}</span>
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
      label: 'Alunos',
      icon: 'group',
      onClick: handleManageStudents,
      variant: 'default' as const
    },
    {
      label: 'Frequência',
      icon: 'fact_check',
      onClick: handleViewAttendance,
      variant: 'secondary' as const
    },
    {
      label: 'Notas',
      icon: 'grade',
      onClick: handleViewGrades,
      variant: 'secondary' as const
    }
  ]

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((classItem) => (
        <Card
          key={classItem.id}
          className="hover:shadow-xl transition-all duration-300 cursor-pointer"
          onClick={() => handleView(classItem)}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                {classItem.name}
              </h3>
              {getStatusBadge(classItem.status)}
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                <span className="font-medium">Código:</span> {classItem.code}
              </p>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                <span className="font-medium">Curso:</span> {classItem.course_name}
              </p>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                <span className="font-medium">Horário:</span> {classItem.schedule}
              </p>
              <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                <span className="font-medium">Alunos:</span> {classItem.enrolled_students || 0}/{classItem.max_students}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleManageStudents(classItem)
                }}
              >
                <span className="material-symbols-outlined">group</span>
                Alunos
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleViewAttendance(classItem)
                }}
              >
                <span className="material-symbols-outlined">fact_check</span>
                Frequência
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleViewGrades(classItem)
                }}
              >
                <span className="material-symbols-outlined">grade</span>
                Notas
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ProtectedRoute requiredRole={[UserRole.TEACHER, UserRole.COORDINATOR, UserRole.SYSTEM_ADMIN]}>
          <DashboardPageLayout
            title="Minhas Turmas"
            subtitle="Gerencie suas turmas e acompanhe o progresso dos alunos"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-opacity-20' : ''}
                  style={{ 
                    backgroundColor: viewMode === 'grid' ? theme.colors.primary.DEFAULT : 'transparent'
                  }}
                >
                  <span className="material-symbols-outlined">grid_view</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-opacity-20' : ''}
                  style={{ 
                    backgroundColor: viewMode === 'list' ? theme.colors.primary.DEFAULT : 'transparent'
                  }}
                >
                  <span className="material-symbols-outlined">list</span>
                </Button>
              </div>
            }
          >
            {viewMode === 'list' ? (
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
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={(classItem) => remove(classItem.id)}
                onView={handleView}
                customActions={customActions}
              />
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <Input
                    type="search"
                    placeholder="Buscar turmas..."
                    leftIcon="search"
                    className="w-64"
                    onChange={(e) => search(e.target.value)}
                  />
                  <Button
                    variant="default"
                    onClick={handleCreate}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Nova Turma
                  </Button>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div 
                      className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full"
                      style={{ 
                        borderColor: theme.colors.primary.DEFAULT,
                        borderTopColor: 'transparent'
                      }}
                    />
                  </div>
                ) : (
                  renderGridView()
                )}
              </>
            )}

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
              size="lg"
            >
              <ClassForm
                classItem={selectedItem}
                mode={modalMode}
                onSubmit={handleSubmit}
                onCancel={() => setModalOpen(false)}
              />
            </Modal>
          </DashboardPageLayout>
        </ProtectedRoute>
      </div>
    </AuthenticatedLayout>
  )
} 