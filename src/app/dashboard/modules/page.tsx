'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import GenericCRUD from '@/components/crud/GenericCRUD'
import Modal from '@/components/ui/Modal'
import ModuleForm from '@/components/forms/ModuleForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useCRUD } from '@/hooks/useCRUD'
import { BaseApiService } from '@/services/api'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

interface Module {
  id: string
  name: string
  description: string
  course_id: string
  course_name?: string
  order: number
  duration_minutes: number
  type: 'video' | 'text' | 'quiz' | 'assignment'
  content_url?: string
  active: boolean
  created_at: string
  updated_at: string
}

const moduleService = new BaseApiService<Module>('/modules')

export default function ModulesPage() {
  const { theme } = useTheme()
  const { isManagement, isTeacher } = usePermissions()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
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
    service: moduleService,
    entityName: 'Módulo',
    autoFetch: true,
    paginated: true
  })

  const handleCreate = () => {
    setSelectedItem(null)
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEdit = (module: Module) => {
    setSelectedItem(module)
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleView = (module: Module) => {
    setSelectedItem(module)
    setModalMode('view')
    setModalOpen(true)
  }

  const handleSubmit = async (data: Partial<Module>) => {
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
      video: { label: 'Vídeo', icon: 'play_circle', color: theme.colors.status.error },
      text: { label: 'Texto', icon: 'article', color: theme.colors.status.info },
      quiz: { label: 'Quiz', icon: 'quiz', color: theme.colors.status.warning },
      assignment: { label: 'Atividade', icon: 'assignment', color: theme.colors.status.success }
    }

    const config = typeConfig[type as keyof typeof typeConfig] || { 
      label: type, 
      icon: 'help',
      color: theme.colors.text.secondary 
    }

    return (
      <span 
        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: config.color + '20',
          color: config.color
        }}
      >
        <span className="material-symbols-outlined text-sm">{config.icon}</span>
        {config.label}
      </span>
    )
  }

  const columns = [
    {
      key: 'order',
      label: '#',
      width: '60px',
      sortable: true
    },
    {
      key: 'name',
      label: 'Nome',
      sortable: true
    },
    {
      key: 'course_name',
      label: 'Curso'
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (module: Module) => getTypeBadge(module.type)
    },
    {
      key: 'duration_minutes',
      label: 'Duração',
      render: (module: Module) => `${module.duration_minutes} min`
    },
    {
      key: 'active',
      label: 'Status',
      render: (module: Module) => (
        <span 
          className="flex items-center gap-2"
          style={{ color: module.active ? theme.colors.status.success : theme.colors.status.error }}
        >
          <span className="material-symbols-outlined text-sm">
            {module.active ? 'check_circle' : 'cancel'}
          </span>
          {module.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ]

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((module) => (
        <Card
          key={module.id}
          variant="elevated"
          className="cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => handleView(module)}
        >
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                  {module.order}. {module.name}
                </h3>
                <p className="text-sm mt-1" style={{ color: theme.colors.text.secondary }}>
                  {module.course_name}
                </p>
              </div>
              {getTypeBadge(module.type)}
            </div>
            
            <p className="text-sm line-clamp-2" style={{ color: theme.colors.text.secondary }}>
              {module.description}
            </p>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                <span className="material-symbols-outlined text-sm align-middle mr-1">schedule</span>
                {module.duration_minutes} min
              </span>
              
              <div className="flex gap-2">
                {(isManagement() || isTeacher()) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(module)
                    }}
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </Button>
                )}
                {isManagement() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(module.id)
                    }}
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER, UserRole.ACADEMIC_COORDINATOR, UserRole.TEACHER]}>
      <DashboardLayout>
        <DashboardPageLayout
          title="Gerenciar Módulos"
          subtitle="Gerencie o conteúdo dos cursos"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <span className="material-symbols-outlined text-base">list</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <span className="material-symbols-outlined text-base">grid_view</span>
              </Button>
            </div>
          }
        >
          {viewMode === 'list' ? (
            <GenericCRUD
              title=""
              entityName="Módulo"
              entityNamePlural="Módulos"
              columns={columns}
              data={data}
              loading={loading}
              totalItems={pagination.total}
              currentPage={pagination.currentPage}
              itemsPerPage={pagination.pageSize}
              onPageChange={setPage}
              onSearch={search}
              onCreate={(isManagement() || isTeacher()) ? handleCreate : undefined}
              onEdit={(isManagement() || isTeacher()) ? handleEdit : undefined}
              onDelete={isManagement() ? (module) => remove(module.id) : undefined}
              onView={handleView}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Input
                  type="search"
                  placeholder="Buscar módulos..."
                  leftIcon="search"
                  className="w-64"
                  onChange={(e) => search(e.target.value)}
                />
                
                {(isManagement() || isTeacher()) && (
                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    icon="add"
                  >
                    Novo Módulo
                  </Button>
                )}
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div 
                    className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto"
                    style={{ 
                      borderColor: theme.colors.primary.DEFAULT,
                      borderTopColor: 'transparent'
                    }}
                  />
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12" style={{ color: theme.colors.text.secondary }}>
                  <span className="material-symbols-outlined text-4xl opacity-50">folder_open</span>
                  <p className="mt-2">Nenhum módulo encontrado</p>
                </div>
              ) : (
                renderGridView()
              )}
            </div>
          )}

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={
              modalMode === 'create' 
                ? 'Novo Módulo' 
                : modalMode === 'edit' 
                  ? 'Editar Módulo' 
                  : 'Visualizar Módulo'
            }
            size="xl"
          >
            <ModuleForm
              module={selectedItem}
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