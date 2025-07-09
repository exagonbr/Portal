'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import GenericCRUD, { CRUDColumn } from '@/components/crud/GenericCRUD'
import Modal from '@/components/ui/Modal'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'
import { SubjectDto } from '@/types/subject'
import { subjectService } from '@/services/subjectService'
import SubjectForm from '@/components/forms/SubjectForm'
import { useToast } from '@/components/ToastManager'
import { Badge } from '@/components/ui/Badge'

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedSubject, setSelectedSubject] = useState<SubjectDto | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const { showSuccess, showError } = useToast()

  const columns: CRUDColumn<SubjectDto>[] = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true
    },
    {
      key: 'description',
      label: 'Descrição',
      sortable: true
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Criado em',
      render: (value) => new Date(value).toLocaleDateString('pt-BR')
    }
  ]

  const loadSubjects = useCallback(async () => {
    setLoading(true)
    try {
      const response = await subjectService.getSubjects({
        page: pagination.currentPage,
        limit: pagination.pageSize,
        search: searchQuery
      }) as PaginatedResponse<SubjectDto>
      
      setSubjects(response.items)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error)
      showError('Não foi possível carregar as disciplinas.')
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.pageSize, searchQuery, showError])

  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  const handleCreate = () => {
    setModalMode('create')
    setSelectedSubject(null)
    setModalOpen(true)
  }

  const handleEdit = (subject: SubjectDto) => {
    setModalMode('edit')
    setSelectedSubject(subject)
    setModalOpen(true)
  }

  const handleView = (subject: SubjectDto) => {
    setModalMode('view')
    setSelectedSubject(subject)
    setModalOpen(true)
  }

  const handleDelete = async (subject: SubjectDto) => {
    try {
      await subjectService.deleteSubject(Number(subject.id))
      showSuccess('Disciplina excluída com sucesso!')
      loadSubjects()
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error)
      showError('Não foi possível excluir a disciplina.')
    }
  }

  const handleToggleStatus = async (subject: SubjectDto) => {
    try {
      await subjectService.toggleSubjectStatus(Number(subject.id))
      showSuccess(`Disciplina ${subject.is_active ? 'desativada' : 'ativada'} com sucesso!`)
      loadSubjects()
    } catch (error) {
      console.error('Erro ao alterar status da disciplina:', error)
      showError('Não foi possível alterar o status da disciplina.')
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await subjectService.createSubject(data)
        showSuccess('Disciplina criada com sucesso!')
      } else if (modalMode === 'edit' && selectedSubject) {
        await subjectService.updateSubject(Number(selectedSubject.id), data)
        showSuccess('Disciplina atualizada com sucesso!')
      }
      setModalOpen(false)
      loadSubjects()
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error)
      showError('Não foi possível salvar a disciplina.')
    }
  }

  const setPage = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }))
  }

  const search = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
  }

  const customActions = [
    {
      label: 'Alterar Status',
      icon: <span className="material-symbols-outlined text-lg">toggle_on</span>,
      onClick: handleToggleStatus,
      variant: 'secondary' as const
    }
  ]

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="Disciplinas"
        subtitle="Gerenciamento de disciplinas do sistema"
      >
        <GenericCRUD
          title=""
          entityName="Disciplina"
          entityNamePlural="Disciplinas"
          columns={columns}
          data={subjects}
          loading={loading}
          totalItems={pagination.total}
          currentPage={pagination.currentPage}
          itemsPerPage={pagination.pageSize}
          onPageChange={setPage}
          onSearch={search}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          customActions={customActions}
        />

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            modalMode === 'create' 
              ? 'Nova Disciplina' 
              : modalMode === 'edit' 
                ? 'Editar Disciplina' 
                : 'Visualizar Disciplina'
          }
          size="md"
        >
          <SubjectForm
            subject={selectedSubject}
            mode={modalMode}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      </DashboardPageLayout>
    </ProtectedRoute>
  )
} 