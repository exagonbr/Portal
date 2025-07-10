'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  teacherSubjectService, 
  TeacherSubject, 
  TeacherSubjectFilter,
  CreateTeacherSubjectDto,
  UpdateTeacherSubjectDto
} from '@/services/teachersubjectService'
import { useToast } from '@/components/ToastManager'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StandardCard'
import Modal from '@/components/ui/Modal'
import SubjectForm from '@/components/forms/SubjectForm'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  BookOpen,
  CheckCircle,
  XCircle,
  GraduationCap,
  AlertCircle,
  Filter,
  X
} from 'lucide-react'

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Interface para estatísticas das disciplinas
interface SubjectStats {
  totalSubjects: number;
  activeSubjects: number;
  inactiveSubjects: number;
  subjectsWithDescription: number;
}

// Interface para filtros
interface SubjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export default function TeacherSubjectsPage() {
  const router = useRouter()
  const { showSuccess, showError, showWarning } = useToast()
  
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [subjects, setSubjects] = useState<TeacherSubject[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  // Filtros
  const [filters, setFilters] = useState<SubjectFilters>({})
  
  // Estados do modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedSubject, setSelectedSubject] = useState<TeacherSubject | null>(null)
  
  // Estados de estatísticas
  const [stats, setStats] = useState<SubjectStats>({
    totalSubjects: 0,
    activeSubjects: 0,
    inactiveSubjects: 0,
    subjectsWithDescription: 0
  })

  // Função para calcular estatísticas baseada na resposta da API
  const calculateStats = useCallback((subjectList: TeacherSubject[], apiResponse?: any): SubjectStats => {
    // Usar total da API se disponível, senão usar o tamanho da lista atual
    const totalSubjects = apiResponse?.total || totalItems || subjectList.length
    
    // Para calcular estatísticas precisas, idealmente faríamos uma chamada separada
    // Por enquanto, calculamos baseado nos dados carregados na página atual
    const activeSubjects = subjectList.filter(subject => subject.isActive).length
    const inactiveSubjects = subjectList.filter(subject => !subject.isActive).length
    const subjectsWithDescription = subjectList.filter(subject => 
      subject.description && subject.description.trim()
    ).length

    return { totalSubjects, activeSubjects, inactiveSubjects, subjectsWithDescription }
  }, [totalItems])

  // Função para carregar disciplinas da API
  const loadSubjects = useCallback(async (page = 1, search = '', subjectFilters: SubjectFilters = {}, showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      const params: TeacherSubjectFilter = {
        page,
        limit: itemsPerPage,
        search: search || undefined,
        isActive: subjectFilters.isActive,
      }

      console.log('🔄 [TEACHER_SUBJECTS] Carregando disciplinas com parâmetros:', params)
      
      const response = await teacherSubjectService.getTeacherSubjects(params)
      
      console.log('✅ [TEACHER_SUBJECTS] Disciplinas carregadas:', {
        items: response.items?.length || 0,
        total: response.total,
        page: response.page
      })
      
      // Mapear dados da API para o formato correto
      const mappedSubjects = response.items?.map(item => ({
        ...item,
        description: item.description || '',
        isActive: item.isActive ?? true,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      })) || []
      
      setSubjects(mappedSubjects)
      setTotalItems(response.total || 0)
      setCurrentPage(page)
      setSearchQuery(search)
      setFilters(subjectFilters)

      // Calcular estatísticas baseado na resposta da API
      const newStats = calculateStats(mappedSubjects, response)
      setStats(newStats)

      if (!showLoadingIndicator) {
        showSuccess("Lista de disciplinas atualizada com sucesso!")
      }
      
    } catch (error: any) {
      console.error('❌ [TEACHER_SUBJECTS] Erro ao carregar disciplinas:', error)
      
      const errorMessage = error.message || "Erro ao carregar disciplinas. Verifique sua conexão e tente novamente."
      
      setSubjects([])
      setTotalItems(0)
      
      showError(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [calculateStats, showSuccess, showError, itemsPerPage])

  // Inicialização
  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  // Recalcular estatísticas quando disciplinas mudarem
  useEffect(() => {
    if (subjects.length > 0) {
      const newStats = calculateStats(subjects)
      setStats(newStats)
    }
  }, [subjects, calculateStats])

  // Handlers de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadSubjects(1, searchQuery, filters)
  }

  const handleFilterChange = (key: keyof SubjectFilters, value: any) => {
    const newFilters = { ...filters }
    if (value === '' || value === undefined || value === null) {
      delete (newFilters as any)[key]
    } else {
      (newFilters as any)[key] = value
    }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    setCurrentPage(1)
    loadSubjects(1, searchQuery, filters)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({})
    setShowFilterPanel(false)
    setCurrentPage(1)
    loadSubjects(1, '', {})
  }

  const handleRefresh = () => {
    loadSubjects(currentPage, searchQuery, filters, false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadSubjects(page, searchQuery, filters)
  }

  // Funções do modal
  const openModal = (mode: 'view' | 'create' | 'edit', subject?: TeacherSubject) => {
    setModalMode(mode)
    setSelectedSubject(subject || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedSubject(null)
  }

  const handleModalSave = async (data: any) => {
    try {
      setLoading(true)
      
      if (modalMode === 'create') {
        const createData: CreateTeacherSubjectDto = {
          name: data.name,
          description: data.description,
          isActive: data.isActive !== undefined ? data.isActive : true
        }
        await teacherSubjectService.createTeacherSubject(createData)
        showSuccess(`Disciplina "${data.name}" criada com sucesso!`)
      } else if (modalMode === 'edit' && selectedSubject) {
        const updateData: UpdateTeacherSubjectDto = {
          name: data.name,
          description: data.description,
          isActive: data.isActive
        }
        await teacherSubjectService.updateTeacherSubject(Number(selectedSubject.id), updateData)
        showSuccess(`Disciplina "${data.name}" atualizada com sucesso!`)
      }
      
      closeModal()
      await loadSubjects(currentPage, searchQuery, filters, false)
    } catch (error: any) {
      console.error('❌ [TEACHER_SUBJECTS] Erro ao salvar disciplina:', error)
      showError("Erro ao salvar disciplina.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubject = async (subject: TeacherSubject) => {
    if (!confirm(`Tem certeza que deseja excluir a disciplina "${subject.name}"?`)) return

    try {
      setLoading(true)
      await teacherSubjectService.deleteTeacherSubject(Number(subject.id))
      showSuccess("Disciplina excluída com sucesso.")
      await loadSubjects(currentPage, searchQuery, filters, false)
    } catch (error: any) {
      console.error('❌ Erro ao excluir disciplina:', error)
      showError("Erro ao excluir disciplina.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (subject: TeacherSubject) => {
    try {
      setLoading(true)
      const updatedSubject = await teacherSubjectService.toggleTeacherSubjectStatus(Number(subject.id))
      const statusText = updatedSubject.isActive ? 'ativada' : 'desativada'
      showSuccess(`Disciplina "${subject.name}" ${statusText} com sucesso!`)
      
      // Atualizar estado local para feedback visual rápido
      const updatedSubjects = subjects.map(sub =>
        sub.id === subject.id ? { ...sub, isActive: updatedSubject.isActive } : sub
      )
      setSubjects(updatedSubjects)
      
      // Recalcular estatísticas
      const newStats = calculateStats(updatedSubjects)
      setStats(newStats)
    } catch (error: any) {
      console.error('❌ Erro ao alterar status da disciplina:', error)
      showError("Erro ao alterar status da disciplina.")
    } finally {
      setLoading(false)
    }
  }

  // Função para mapear TeacherSubject para o formato esperado pelo SubjectForm
  const mapToSubjectForm = (subject: TeacherSubject | null) => {
    if (!subject) return null
    return {
      id: subject.id,
      name: subject.name,
      description: subject.description || '',
      is_active: subject.isActive,
      created_at: subject.createdAt,
      updated_at: subject.updatedAt
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Minhas Disciplinas</h1>
              <p className="text-gray-600 mt-1">Gerencie suas disciplinas do sistema educacional</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={refreshing || loading} 
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={() => openModal('create')} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Disciplina
              </Button>
            </div>
          </div>

          {/* Stats baseados na API */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={BookOpen}
              title="Total"
              value={stats.totalSubjects}
              subtitle="Disciplinas"
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              title="Ativas"
              value={stats.activeSubjects}
              subtitle="Funcionando"
              color="green"
            />
            <StatCard
              icon={XCircle}
              title="Inativas"
              value={stats.inactiveSubjects}
              subtitle="Desativadas"
              color="red"
            />
            <StatCard
              icon={GraduationCap}
              title="Com Descrição"
              value={stats.subjectsWithDescription}
              subtitle="Descrições"
              color="purple"
            />
          </div>

          {/* Search & Filter */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar disciplina..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={loading}>
                Buscar
              </Button>
              <Button 
                onClick={() => setShowFilterPanel(!showFilterPanel)} 
                variant="outline" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </form>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                    <select
                      value={filters.isActive === undefined ? '' : String(filters.isActive)}
                      onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    >
                      <option value="">Todas</option>
                      <option value="true">Ativa</option>
                      <option value="false">Inativa</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="ghost" onClick={clearFilters} disabled={loading}>
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                  <Button onClick={applyFilters} disabled={loading}>
                    Aplicar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content baseado nos dados da API */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando disciplinas...</span>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma disciplina encontrada</p>
              <p className="text-gray-400 text-sm">
                {searchQuery || Object.keys(filters).length > 0 
                  ? "Tente ajustar sua busca ou filtros." 
                  : "Clique em \"Nova Disciplina\" para adicionar a primeira"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disciplina
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {subject.name || 'Nome não informado'}
                              </div>
                              <div className="text-xs text-gray-500">ID: {subject.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {subject.description ? (
                              subject.description.length > 100 
                                ? `${subject.description.substring(0, 100)}...`
                                : subject.description
                            ) : (
                              <span className="text-gray-400">Sem descrição</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={subject.isActive ? 'success' : 'danger'}>
                            {subject.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('view', subject)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('edit', subject)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubject(subject)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {subject.name || 'Nome não informado'}
                          </h3>
                          <div className="text-xs text-gray-500">ID: {subject.id}</div>
                        </div>
                      </div>
                      <Badge variant={subject.isActive ? 'success' : 'danger'}>
                        {subject.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      {subject.description && (
                        <div className="text-sm text-gray-600">
                          {subject.description.length > 150 
                            ? `${subject.description.substring(0, 150)}...`
                            : subject.description
                          }
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Criado em: {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openModal('view', subject)}>
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openModal('edit', subject)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteSubject(subject)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination baseada na API */}
        {totalPages > 1 && !loading && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} disciplinas
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-700">
                {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
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
          subject={mapToSubjectForm(selectedSubject)}
          mode={modalMode}
          onSubmit={handleModalSave}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
} 